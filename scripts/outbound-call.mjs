/**
 * Place a real ElevenLabs Twilio outbound call with an explicit greeting.
 * Usage: node scripts/outbound-call.mjs [+91...]
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const envContent = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

const apiKey = getEnv("ELEVENLABS_API_KEY");
const agentId = getEnv("ELEVENLABS_INTAKE_AGENT_ID");
const phoneId = getEnv("ELEVENLABS_AGENT_PHONE_NUMBER_ID");
const toNumber = process.argv[2] || "+919150135790";
const firstMessage =
  "Hello, this is Raksha, the emergency cyber fraud helpline. Which language are you comfortable in — English, Hindi, or Tamil?";

if (!apiKey || !agentId || !phoneId) {
  console.error("Missing ELEVENLABS_API_KEY, ELEVENLABS_INTAKE_AGENT_ID, or ELEVENLABS_AGENT_PHONE_NUMBER_ID");
  process.exit(1);
}

const protocolOrigin = (
  getEnv("PROTOCOL_PUBLIC_ORIGIN") || "https://raksha-protocol.onrender.com"
).replace(/\/$/, "");

async function wakeProtocol() {
  for (let i = 0; i < 4; i++) {
    try {
      const health = await fetch(`${protocolOrigin}/health`, { signal: AbortSignal.timeout(90_000) });
      if (health.ok) {
        console.log("Protocol host is awake.");
        return;
      }
    } catch (err) {
      console.log(`Wake attempt ${i + 1} failed: ${err?.message || err}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.warn("Protocol host did not answer /health. Continuing anyway.");
}

await wakeProtocol();

const res = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
  method: "POST",
  headers: {
    "xi-api-key": apiKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    agent_id: agentId,
    agent_phone_number_id: phoneId,
    to_number: toNumber,
    conversation_initiation_client_data: {
      conversation_config_override: {
        agent: {
          first_message: firstMessage,
          language: "en",
        },
      },
    },
  }),
});

const text = await res.text();
console.log("HTTP", res.status);
console.log(text);
if (!res.ok) process.exit(1);
