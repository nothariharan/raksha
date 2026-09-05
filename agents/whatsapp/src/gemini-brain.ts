/**
 * Gemini rewrites WhatsApp replies so they sound like a first responder.
 * Core still owns the RKS-* case, questions, and CAP. This only speaks.
 */

import { generateGeminiText } from "@raksha/shared";
import { SupportedLanguage } from "@raksha/i18n";

export async function speakRakshaReply(input: {
  citizenMessage: string;
  language: SupportedLanguage;
  draft: string;
  incidentId: string | null;
  state: string | null;
}): Promise<string> {
  const draft = (input.draft || "").trim();
  if (!draft) return draft;

  const spoken = await generateGeminiText({
    timeoutMs: 7000,
    maxOutputTokens: 350,
    system: `You are Raksha, India's emergency financial-fraud first responder on WhatsApp.
Speak in the citizen's language. Keep replies under 90 words. Be calm, specific, and civic — not a chatbot.
You may rephrase the draft so it sounds human. You must keep every fact, case id, option number, YES/NO instruction, and 1930 reference from the draft.
Never invent amount, UTR, bank, or a case id. Never say you filed a report unless the draft already says so.
Never ask the citizen to whitelist a number. Output only the WhatsApp message text.`,
    user: `Language: ${input.language}
State: ${input.state || "new"}
Case: ${input.incidentId || "none yet"}
Citizen just said: ${input.citizenMessage || "(empty)"}
Required draft (preserve facts and choices):
${draft}`,
  });

  return spoken || draft;
}
