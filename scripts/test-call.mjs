/**
 * Print phone ↔ ElevenLabs intake wiring from .env.local (no secrets logged).
 * Usage: node scripts/test-call.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}
const envContent = readFileSync(envPath, "utf-8");
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

const agentId = getEnv("ELEVENLABS_WEB_AGENT_ID") || getEnv("ELEVENLABS_INTAKE_AGENT_ID");
const phoneId = getEnv("ELEVENLABS_AGENT_PHONE_NUMBER_ID");
const hasKey = Boolean(getEnv("ELEVENLABS_API_KEY") && !getEnv("ELEVENLABS_API_KEY").startsWith("synthetic_"));

console.log("ElevenLabs intake agent:", agentId || "(missing)");
console.log("Phone number id:", phoneId || "(missing)");
console.log("API key configured:", hasKey);
console.log("Ready for /app signed-url + phone intake using ELEVENLABS_INTAKE_AGENT_ID.");
