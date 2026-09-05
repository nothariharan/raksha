import { SupportedLanguage } from "@raksha/i18n";

const LANGUAGE_ALIASES: Array<{ lang: SupportedLanguage; tokens: string[] }> = [
  { lang: "en", tokens: ["1", "en", "eng", "english"] },
  { lang: "hi", tokens: ["2", "hi", "hin", "hindi", "हिंदी", "हिन्दी"] },
  { lang: "ta", tokens: ["3", "ta", "tam", "tamil", "தமிழ்"] },
  { lang: "te", tokens: ["4", "te", "tel", "telugu", "తెలుగు"] },
  { lang: "kn", tokens: ["5", "kn", "kan", "kannada", "ಕನ್ನಡ"] },
  { lang: "bn", tokens: ["6", "bn", "ben", "bangla", "bengali", "বাংলা"] },
  { lang: "mr", tokens: ["7", "mr", "mar", "marathi", "मराठी"] },
];

export function normalizeSupportedLanguage(raw?: string): SupportedLanguage | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().slice(0, 2);
  const hit = LANGUAGE_ALIASES.find((row) => row.lang === key);
  return hit?.lang ?? null;
}

export function parseLanguageChoice(text: string): SupportedLanguage | null {
  const raw = (text || "").trim();
  if (!raw) return null;
  const compact = raw.toLowerCase().replace(/[.!?,]/g, "");
  for (const row of LANGUAGE_ALIASES) {
    if (row.tokens.some((token) => token.toLowerCase() === compact || token === raw)) {
      return row.lang;
    }
  }
  return normalizeSupportedLanguage(raw);
}

export const LANGUAGE_PICKER_TEXT = [
  "🛡️ *Raksha / रक्षा*",
  "",
  "Please choose your language / कृपया भाषा चुनें:",
  "",
  "1️⃣ English",
  "2️⃣ हिन्दी",
  "3️⃣ தமிழ்",
  "4️⃣ తెలుగు",
  "5️⃣ ಕನ್ನಡ",
  "6️⃣ বাংলা",
  "7️⃣ मराठी",
  "",
  "Reply with the number or language name.",
].join("\n");
