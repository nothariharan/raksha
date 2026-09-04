/**
 * Verify Fireworks key + pick a working vision model, then pin FIREWORKS_VISION_MODEL.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
const env = readFileSync(envPath, "utf8");
function getEnv(key) {
  const m = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim() : process.env[key];
}
const key = getEnv("FIREWORKS_API_KEY");
if (!key || key.startsWith("synthetic")) {
  console.error("FIREWORKS_API_KEY missing");
  process.exit(1);
}

const imgRes = await fetch(
  "https://storage.googleapis.com/fireworks-public/image_assets/fireworks-ai-wordmark-color-dark.png"
);
const b64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
const dataUrl = `data:image/png;base64,${b64}`;

const candidates = [
  "accounts/fireworks/models/glm-5p3-flash",
  "accounts/fireworks/models/kimi-k3",
  "accounts/fireworks/models/deepseek-v4-flash-vision-exp",
  "accounts/fireworks/models/kimi-k2p6",
];

async function callModel(model, maxTokens) {
  const res = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Return ONLY JSON: {"readable":true,"amount":null,"transactionId":null,"summary":"short description"}',
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  const json = await res.json();
  const msg = json.choices?.[0]?.message || {};
  const content = String(msg.content || "").trim();
  const reasoning = String(msg.reasoning_content || "").trim();
  return {
    http: res.status,
    ok: res.ok,
    content,
    reasoning: reasoning.slice(0, 160),
    finish: json.choices?.[0]?.finish_reason,
    error: json.error || null,
  };
}

let winner = null;
for (const model of candidates) {
  const maxTokens = /kimi/i.test(model) ? 2500 : 500;
  const result = await callModel(model, maxTokens);
  console.log(
    JSON.stringify(
      {
        model: model.split("/").pop(),
        http: result.http,
        finish: result.finish,
        contentPreview: result.content.slice(0, 220),
        reasoningPreview: result.reasoning,
        error: result.error,
      },
      null,
      2
    )
  );
  if (result.ok && result.content) {
    winner = model;
    break;
  }
  // Kimi sometimes only fills reasoning — accept if JSON appears there after enough tokens
  if (result.ok && /\{[\s\S]*"summary"[\s\S]*\}/.test(result.reasoning)) {
    winner = model;
    break;
  }
}

if (!winner) {
  console.error("NO_WORKING_VISION_MODEL");
  process.exit(2);
}

let next = env;
if (/^FIREWORKS_VISION_MODEL=/m.test(next)) {
  next = next.replace(/^FIREWORKS_VISION_MODEL=.*$/m, `FIREWORKS_VISION_MODEL=${winner}`);
} else {
  next += `\nFIREWORKS_VISION_MODEL=${winner}\n`;
}
writeFileSync(envPath, next, "utf8");
console.log(`FIREWORKS_VISION_OK model=${winner}`);
