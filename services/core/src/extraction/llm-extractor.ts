/**
 * OpenAI LLM Extractor for Raksha Core
 * Uses OpenAI API (gpt-4o-mini / luna) for deep semantic extraction from citizen narratives,
 * with deterministic fallback to the local regex/heuristic engine.
 */

import { ExtractedFraudCandidate, ExtractionInput } from "./extraction-types.js";
import { TextExtractor } from "./text-extractor.js";

export class LLMExtractor {
  static async extract(input: ExtractionInput): Promise<ExtractedFraudCandidate> {
    const fallback = TextExtractor.extract(input);
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL === "luna" ? "gpt-4o-mini" : (process.env.OPENAI_MODEL || "gpt-4o-mini");

    if (!apiKey || !input.content || input.content.trim().length === 0) {
      return fallback;
    }

    try {
      const prompt = `You are a financial cyber-fraud data extraction engine for India's 1930 Cyber Crime Helpline.
Extract the structured fraud details from the citizen's text/transcript below.
Return ONLY valid JSON matching this schema:
{
  "amount": number or null,
  "fraudCategory": "ELECTRICITY_BILL_SCAM" | "DIGITAL_ARREST" | "UPI_PAYMENT_FRAUD" | "TASK_SCAM" | "KYC_UPDATE_FRAUD" | "LOTTERY_PHISHING" | "CUSTOMER_CARE_IMPERSONATION" | "OTHER",
  "channel": "UPI" | "CARD" | "BANK_TRANSFER" | "WALLET" | "OTHER",
  "application": "PhonePe" | "Google Pay" | "Paytm" | "BHIM" | "CRED" | "NetBanking" | null,
  "transactionId": string or null (12-digit UTR/RRN if found),
  "debitInstitution": string or null (e.g. "State Bank of India"),
  "beneficiaryIdentifier": string or null (e.g. UPI VPA or phone number)
}

Citizen Text:
"${input.content}"`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You extract structured Indian financial cyber-fraud details. Respond in strict JSON only." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return fallback;
      }

      const data = (await res.json()) as any;
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) return fallback;

      const parsed = JSON.parse(rawContent);
      const sourceId = input.sourceId || "llm#1";

      const candidate: ExtractedFraudCandidate = {
        ...fallback,
        amount: typeof parsed.amount === "number" && parsed.amount > 0 ? parsed.amount : fallback.amount,
        fraudCategory: parsed.fraudCategory || fallback.fraudCategory,
        channel: parsed.channel || fallback.channel,
        application: parsed.application || fallback.application,
        transactionId: parsed.transactionId && /^\d{12}$/.test(parsed.transactionId) ? parsed.transactionId : fallback.transactionId,
        debitInstitution: parsed.debitInstitution || fallback.debitInstitution,
        beneficiaryIdentifier: parsed.beneficiaryIdentifier || fallback.beneficiaryIdentifier,
        confidence: {
          ...fallback.confidence,
          llm_verified: 0.95,
        },
        sourceRefs: {
          ...fallback.sourceRefs,
          llm: [sourceId],
        },
        extractedAt: new Date().toISOString(),
      };

      return candidate;
    } catch (err) {
      // Graceful fallback to deterministic local extractor
      return fallback;
    }
  }
}
