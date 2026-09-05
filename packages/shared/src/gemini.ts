/**
 * Gemini Developer API helper.
 * Default model is a current cheap Flash Lite — not a preview or shutdown ID.
 */

export const GEMINI_MODEL_CANDIDATES = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
] as const;

export function geminiApiKey(): string {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key || /synthetic/i.test(key)) return "";
  return key;
}

export function preferredGeminiModel(): string {
  const requested = (process.env.GEMINI_MODEL || "").trim();
  if (requested && !/preview|deprecated/i.test(requested)) return requested;
  return GEMINI_MODEL_CANDIDATES[0];
}

export async function generateGeminiText(options: {
  system: string;
  user: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
}): Promise<string | null> {
  const apiKey = geminiApiKey();
  if (!apiKey) return null;

  const models = uniqueModels(preferredGeminiModel());
  for (const model of models) {
    const text = await callGemini(apiKey, model, options);
    if (text) return text;
  }
  return null;
}

function uniqueModels(first: string): string[] {
  return [first, ...GEMINI_MODEL_CANDIDATES.filter((m) => m !== first)];
}

async function callGemini(
  apiKey: string,
  model: string,
  options: { system: string; user: string; maxOutputTokens?: number; timeoutMs?: number }
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.system }] },
        contents: [{ role: "user", parts: [{ text: options.user }] }],
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens ?? 400,
          thinkingConfig: { thinkingLevel: "MINIMAL" },
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 400) {
        return callGeminiPlain(apiKey, model, options, controller.signal);
      }
      return null;
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGeminiPlain(
  apiKey: string,
  model: string,
  options: { system: string; user: string; maxOutputTokens?: number },
  signal: AbortSignal
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: options.system }] },
      contents: [{ role: "user", parts: [{ text: options.user }] }],
      generationConfig: { maxOutputTokens: options.maxOutputTokens ?? 400 },
    }),
    signal,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
  return text || null;
}
