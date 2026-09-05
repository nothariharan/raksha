import { SupportedLanguage } from "@raksha/i18n";

const FRAUDISH =
  /scam|fraud|utr|paid|rupee|₹|\brs\b|bank|upi|otp|freeze|report|status|lost|money|amount|transfer|debit|credit|screenshot|filed|tracking|case\b/i;

const GREETING_ONLY = /^(hi+|hii+|hello|hey|yo|ok|okay|haan|ha|namaste|vanakkam)$/i;

export function detectSpokenLanguagePick(speech: string): SupportedLanguage | null {
  const raw = (speech || "").trim();
  if (!raw || raw.length > 90) return null;
  if (FRAUDISH.test(raw)) return null;

  const compact = raw
    .toLowerCase()
    .replace(/[.!?,']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!compact || GREETING_ONLY.test(compact)) return null;

  const hiHit = /हिंदी|हिन्दी|\bhindi\b|\bhinglish\b/i.test(raw);
  const taHit = /தமிழ்|\btamil\b/i.test(raw);
  const enHit = /\benglish\b|\beng\b/i.test(compact);
  const hits = [hiHit, taHit, enHit].filter(Boolean).length;
  if (hits !== 1) return null;

  if (hiHit) return "hi";
  if (taHit) return "ta";
  return "en";
}

export function languagePickAck(lang: SupportedLanguage): string {
  if (lang === "hi") {
    return "ठीक है, हिंदी में बात करते हैं। बताइए क्या हुआ, या अगर रिपोर्ट पहले दर्ज है तो स्टेटस कहिए।";
  }
  if (lang === "ta") {
    return "சரி, தமிழில் தொடர்கிறேன். என்ன நடந்தது என்று சொல்லுங்கள், அல்லது ஏற்கனவே புகார் இருந்தால் status என்று சொல்லுங்கள்.";
  }
  return "Okay, we will continue in English. Tell me what happened, or say status if you already filed a report.";
}

export function languagePickResult(lang: SupportedLanguage): {
  incidentId: string;
  state: string;
  promptForCaller: string;
  isReady: boolean;
} {
  return {
    incidentId: "",
    state: "ASK_USER",
    promptForCaller: languagePickAck(lang),
    isReady: false,
  };
}
