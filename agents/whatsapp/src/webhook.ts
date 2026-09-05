/**
 * WhatsApp Webhook HTTP Server
 * Accepts Twilio form-urlencoded and JSON simulator payloads.
 * Every inbound turn is processed, then replied via Twilio REST outbound.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { RawWhatsAppPayload } from "./message-normalizer.js";
import { WhatsAppService, defaultWhatsAppService } from "./whatsapp-service.js";
import { wireWhatsAppHandoffSubscriber } from "./handoff-subscriber.js";
import {
  parseFormUrlEncoded,
  reconstructTwilioWebhookUrl,
  shouldValidateTwilioSignature,
  validateTwilioSignature,
} from "./twilio.js";

function readRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Twilio-Signature",
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendEmptyTwiml(res: ServerResponse): void {
  res.writeHead(200, {
    "Content-Type": "text/xml",
    "Access-Control-Allow-Origin": "*",
  });
  res.end('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
}

function isTwilioShaped(req: IncomingMessage, contentType: string): boolean {
  return Boolean(req.headers["x-twilio-signature"]) || contentType.includes("application/x-www-form-urlencoded");
}

export async function handleWhatsAppRequest(
  req: IncomingMessage,
  res: ServerResponse,
  service?: WhatsAppService
): Promise<void> {
  const ws = service || defaultWhatsAppService;
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Twilio-Signature",
    });
    res.end();
    return;
  }

  try {
    if (pathname === "/health" && method === "GET") {
      sendJson(res, 200, {
        status: "ok",
        service: "raksha-agent-whatsapp",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if ((pathname === "/whatsapp/webhook" || pathname === "/webhook") && method === "POST") {
      const raw = await readRawBody(req);
      const contentType = String(req.headers["content-type"] || "");
      const formParams = contentType.includes("application/x-www-form-urlencoded")
        ? parseFormUrlEncoded(raw)
        : {};

      if (shouldValidateTwilioSignature(req)) {
        const signature = String(req.headers["x-twilio-signature"] || "");
        const token = process.env.TWILIO_AUTH_TOKEN || "";
        const signedUrl = reconstructTwilioWebhookUrl(req, pathname);
        if (!validateTwilioSignature(token, signature, signedUrl, formParams)) {
          sendJson(res, 403, { error: "INVALID_TWILIO_SIGNATURE" });
          return;
        }
      }

      let body: RawWhatsAppPayload;
      if (Object.keys(formParams).length > 0) {
        body = formParams as RawWhatsAppPayload;
      } else {
        body = raw.trim() ? (JSON.parse(raw) as RawWhatsAppPayload) : {};
      }

      const result = await ws.handleIncomingMessage(body);
      if (isTwilioShaped(req, contentType)) {
        sendEmptyTwiml(res);
        return;
      }
      sendJson(res, 200, result);
      return;
    }

    if ((pathname === "/whatsapp/notify" || pathname === "/notify") && method === "POST") {
      const raw = await readRawBody(req);
      const body = raw.trim()
        ? (JSON.parse(raw) as {
            mobile: string;
            incidentId: string;
            referenceNumber: string;
            amount?: number;
            channel?: string;
            bank?: string;
            utr?: string;
          })
        : ({} as { mobile: string; incidentId: string; referenceNumber: string });
      const result = await ws.notifyCitizenIncidentAccepted(body);
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error("[WhatsAppWebhook Error]:", err);
    sendJson(res, 500, { error: (err as Error).message || "Internal Error" });
  }
}

export function createWhatsAppWebhookServer(service?: WhatsAppService) {
  wireWhatsAppHandoffSubscriber(service);
  return createServer((req, res) => handleWhatsAppRequest(req, res, service));
}
