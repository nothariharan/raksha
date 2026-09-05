import { readFileSync } from "node:fs";
import { join } from "node:path";

const envContent = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : process.env[key];
}

const apiKey = getEnv("ELEVENLABS_API_KEY");
const phoneId = getEnv("ELEVENLABS_AGENT_PHONE_NUMBER_ID");
const agentId = getEnv("ELEVENLABS_INTAKE_AGENT_ID");

if (!apiKey || !phoneId || !agentId) {
  console.error("Missing ELEVENLABS_API_KEY, ELEVENLABS_AGENT_PHONE_NUMBER_ID, or ELEVENLABS_INTAKE_AGENT_ID");
  process.exit(1);
}

async function assignNumberToRaksha() {
  const url = `https://api.elevenlabs.io/v1/convai/phone-numbers/${phoneId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: agentId,
      label: "Raksha Emergency Cyber Helpline",
    }),
  });
  console.log("Update status:", res.status);
  const data = await res.json();
  console.log("Assigned agent:", data.agent_id || data.assigned_agent?.agent_id);
  console.log("Number:", data.phone_number);
}

assignNumberToRaksha().catch((err) => {
  console.error(err);
  process.exit(1);
});
