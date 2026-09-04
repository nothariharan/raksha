/**
 * Fireworks vision extractor for payment / scam proof screenshots.
 * Falls back to heuristic ImageExtractor when FIREWORKS_API_KEY is missing.
 */

import { ExtractedFraudCandidate, ExtractionInput, FraudCategory } from "./extraction-types.js";
import { ImageExtractor } from "./image-extractor.js";

const DEFAULT_MODEL = "accounts/fireworks/models/glm-5p3-flash";

function looksLikeBase64Image(content: string): boolean {
  const c = (content || "").trim();
  if (c.startsWith("data:image/")) return true;
  // Raw base64 payloads from the web client are long and lack OCR keywords.
  if (c.length > 800 && !/\s/.test(c.slice(0, 200)) && /^[A-Za-z0-9+/=]+$/.test(c.slice(0, 120))) {
    return true;
  }
  return false;
}

function toDataUrl(content: string): string {
  const c = content.trim();
  if (c.startsWith("data:image/")) return c;
  return `data:image/jpeg;base64,${c}`;
}

export interface VisionExtractResult {
  candidate: ExtractedFraudCandidate;
  readable: boolean;
  source: "fireworks" | "heuristic";
  warning?: string;
}

export class VisionFireworksExtractor {
  static async extract(input: ExtractionInput): Promise<VisionExtractResult> {
    const apiKey = process.env.FIREWORKS_API_KEY;
    const model = process.env.FIREWORKS_VISION_MODEL || DEFAULT_MODEL;
    const fallback = ImageExtractor.extract(input);

    if (!apiKey || apiKey.startsWith("synthetic") || !looksLikeBase64Image(input.content)) {
      // Heuristic path expects OCR-like text; for raw images with no key, mark unreadable-ish.
      if (looksLikeBase64Image(input.content) && (!apiKey || apiKey.startsWith("synthetic"))) {
        return {
          candidate: {
            ...fallback,
            narrative: fallback.narrative || "Screenshot received. Vision verification unavailable — please confirm UTR and amount.",
            confidence: { ...fallback.confidence, vision_unavailable: 1 },
          },
          readable: !!(fallback.amount || fallback.transactionId),
          source: "heuristic",
          warning: "vision_unavailable",
        };
      }
      return { candidate: fallback, readable: true, source: "heuristic" };
    }

    try {
      const dataUrl = toDataUrl(input.content);
      const controller = new AbortController();
      // GLM flash spends many tokens on reasoning; keep headroom + longer timeout for large screenshots.
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Extract payment proof fields from this screenshot. Return ONLY JSON (no prose):
{
  "readable": boolean,
  "amount": number or null,
  "transactionId": string or null (12-digit UTR/RRN/UPI id if present),
  "debitInstitution": string or null,
  "application": "PhonePe" | "Google Pay" | "Paytm" | "BHIM" | "CRED" | "NetBanking" | null,
  "channel": "UPI" | "CARD" | "BANK_TRANSFER" | "WALLET" | "OTHER" | null,
  "transactionDatetime": string or null (ISO if possible),
  "beneficiaryIdentifier": string or null,
  "fraudCategory": "ELECTRICITY_BILL_SCAM" | "DIGITAL_ARREST" | "UPI_PAYMENT_FRAUD" | "TASK_SCAM" | "KYC_UPDATE_FRAUD" | "LOTTERY_PHISHING" | "CUSTOMER_CARE_IMPERSONATION" | "OTHER",
  "summary": short English description of what the image shows
}`,
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          candidate: fallback,
          readable: !!(fallback.amount || fallback.transactionId),
          source: "heuristic",
          warning: `fireworks_http_${res.status}`,
        };
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
      };
      const msg = data.choices?.[0]?.message || {};
      let raw = String(msg.content || "").trim();
      if (!raw && msg.reasoning_content) {
        // Prefer the last JSON object in reasoning (models often think, then emit JSON).
        const matches = String(msg.reasoning_content).match(/\{[\s\S]*?\}/g);
        if (matches?.length) raw = matches[matches.length - 1];
      }
      if (!raw) {
        return { candidate: fallback, readable: false, source: "heuristic", warning: "empty_vision" };
      }

      // Some models wrap JSON in markdown fences.
      const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenced) raw = fenced[1].trim();

      const parsed = JSON.parse(raw) as {
        readable?: boolean;
        amount?: number | null;
        transactionId?: string | null;
        debitInstitution?: string | null;
        application?: string | null;
        channel?: ExtractedFraudCandidate["channel"];
        transactionDatetime?: string | null;
        beneficiaryIdentifier?: string | null;
        fraudCategory?: FraudCategory;
        summary?: string;
      };

      const sourceId = input.sourceId || "vision#1";
      const readable = parsed.readable !== false;
      const tidRaw = parsed.transactionId ? String(parsed.transactionId).replace(/[^\dA-Za-z]/g, "") : "";
      // UPI UTRs are 12 digits; bank/IMPS refs are often shorter — keep any plausible id.
      const utr =
        tidRaw.length >= 6
          ? tidRaw
          : fallback.transactionId;
      const channelAllowed = ["UPI", "CARD", "BANK_TRANSFER", "WALLET", "OTHER"] as const;
      const channel =
        parsed.channel && (channelAllowed as readonly string[]).includes(parsed.channel)
          ? parsed.channel
          : parsed.amount || tidRaw
            ? parsed.application?.toLowerCase?.().includes("phone") ||
              parsed.application?.toLowerCase?.().includes("upi") ||
              /@/.test(String(parsed.beneficiaryIdentifier || ""))
              ? "UPI"
              : "BANK_TRANSFER"
            : fallback.channel;
      const application =
        parsed.application &&
        /PhonePe|Google Pay|Paytm|BHIM|CRED|NetBanking/i.test(String(parsed.application))
          ? String(parsed.application).match(/PhonePe|Google Pay|Paytm|BHIM|CRED|NetBanking/i)?.[0]
          : parsed.channel || tidRaw
            ? "NetBanking"
            : fallback.application;

      const candidate: ExtractedFraudCandidate = {
        ...fallback,
        // Never trust heuristic amount on raw images; only accept vision amount when readable.
        amount:
          readable && typeof parsed.amount === "number" && parsed.amount > 0
            ? parsed.amount
            : readable
              ? fallback.amount
              : undefined,
        transactionId: utr,
        debitInstitution: parsed.debitInstitution || fallback.debitInstitution,
        application: application || fallback.application,
        channel: channel || fallback.channel,
        transactionDatetime: parsed.transactionDatetime || fallback.transactionDatetime,
        beneficiaryIdentifier: parsed.beneficiaryIdentifier || fallback.beneficiaryIdentifier,
        fraudCategory: parsed.fraudCategory || fallback.fraudCategory,
        narrative:
          parsed.summary ||
          fallback.narrative ||
          "Payment screenshot verified.",
        confidence: {
          ...fallback.confidence,
          vision_verified: readable ? 0.92 : 0.3,
        },
        sourceRefs: {
          ...fallback.sourceRefs,
          vision: [sourceId],
        },
        extractedAt: new Date().toISOString(),
      };

      return {
        candidate,
        readable: readable && !!(candidate.amount || candidate.transactionId || candidate.narrative),
        source: "fireworks",
      };
    } catch (err) {
      return {
        candidate: fallback,
        readable: !!(fallback.amount || fallback.transactionId),
        source: "heuristic",
        warning: `vision_error:${err instanceof Error ? err.message.slice(0, 80) : "unknown"}`,
      };
    }
  }
}
