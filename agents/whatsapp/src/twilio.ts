/**
 * Twilio WhatsApp helpers — signature verification, form parsing, outbound send.
 * Conversational replies go out on the REST Messages API (not TwiML <Message>)
 * so inbound JSON simulators and live Twilio do not double-send.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { IncomingMessage } from "node:http";

export function isSyntheticTwilioToken(token?: string): boolean {
  if (!token) return true;
  return /synthetic/i.test(token);
}

export function parseFormUrlEncoded(body: string): Record<string, string> {
  const params: Record<string, string> = {};
  const search = new URLSearchParams(body);
  for (const [key, value] of search.entries()) {
    params[key] = value;
  }
  return params;
}

export function computeTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>
): string {
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((key) => key + params[key])
      .join("");
  return createHmac("sha1", authToken).update(data, "utf8").digest("base64");
}

export function validateTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!authToken || !signature) return false;
  const expected = computeTwilioSignature(authToken, url, params);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function reconstructTwilioWebhookUrl(req: IncomingMessage, pathname: string): string {
  if (process.env.TWILIO_WEBHOOK_URL) {
    return process.env.TWILIO_WEBHOOK_URL;
  }
  const origin = (process.env.PROTOCOL_PUBLIC_ORIGIN || "").replace(/\/$/, "");
  if (origin) return `${origin}${pathname}`;
  const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "localhost").split(",")[0].trim();
  return `${proto}://${host}${pathname}`;
}

export function shouldValidateTwilioSignature(req: IncomingMessage): boolean {
  if (process.env.TWILIO_VALIDATE_SIGNATURE === "true") return true;
  if (process.env.TWILIO_VALIDATE_SIGNATURE === "false" && !req.headers["x-twilio-signature"]) {
    return false;
  }
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  if (req.headers["x-twilio-signature"]) return true;
  const productionLike =
    process.env.NODE_ENV === "production" || process.env.RAKSHA_GATEWAY_MODE === "unified";
  if (productionLike && !isSyntheticTwilioToken(token)) {
    const contentType = String(req.headers["content-type"] || "");
    if (contentType.includes("application/x-www-form-urlencoded")) return true;
  }
  return false;
}

export interface TwilioOutboundResult {
  attempted: boolean;
  sent: boolean;
  skipped?: boolean;
  sid?: string;
  error?: string;
}

export function hasLiveTwilioCredentials(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const from = process.env.TWILIO_FROM_NUMBER || "";
  return Boolean(sid && token && from && !isSyntheticTwilioToken(token) && !/synthetic/i.test(sid));
}

export async function sendTwilioWhatsApp(
  to: string,
  body: string
): Promise<TwilioOutboundResult> {
  if (!body.trim()) {
    return { attempted: false, sent: false, skipped: true };
  }
  if (!hasLiveTwilioCredentials()) {
    return { attempted: false, sent: false, skipped: true };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID as string;
  const token = process.env.TWILIO_AUTH_TOKEN as string;
  const fromRaw = process.env.TWILIO_FROM_NUMBER as string;
  const fromNumber = fromRaw.startsWith("whatsapp:") ? fromRaw : `whatsapp:${fromRaw}`;
  const cleanTo = to.replace(/whatsapp:/i, "").trim();
  const toNumber = cleanTo.startsWith("+") || /^\d+$/.test(cleanTo) ? `whatsapp:${cleanTo.startsWith("+") ? cleanTo : `+${cleanTo}`}` : `whatsapp:${cleanTo}`;

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: body,
      }).toString(),
    });
    const data = (await res.json().catch(() => ({}))) as { sid?: string; message?: string };
    if (!res.ok) {
      return { attempted: true, sent: false, error: data.message || `Twilio HTTP ${res.status}` };
    }
    return { attempted: true, sent: true, sid: data.sid };
  } catch (err) {
    return { attempted: true, sent: false, error: (err as Error).message };
  }
}
