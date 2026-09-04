/**
 * Smoke-test ElevenLabs signed URL minting using .env.local credentials.
 * Usage: node scripts/test-signed-url.mjs
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
  return match ? match[1].trim() : process.env[key];
}

const apiKey = getEnv("ELEVENLABS_API_KEY");
const agentId =
  getEnv("ELEVENLABS_WEB_AGENT_ID") || getEnv("ELEVENLABS_INTAKE_AGENT_ID");

if (!apiKey || !agentId) {
  console.error("Need ELEVENLABS_API_KEY and ELEVENLABS_INTAKE_AGENT_ID in .env.local");
  process.exit(1);
}

const url =
  "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=" +
  encodeURIComponent(agentId);

const res = await fetch(url, { headers: { "xi-api-key": apiKey } });
console.log("agent:", agentId);
console.log("Signed URL status:", res.status);
const data = await res.json();
console.log("has signed_url:", Boolean(data.signed_url || data.signedUrl));
if (!res.ok) console.log(JSON.stringify(data, null, 2));
