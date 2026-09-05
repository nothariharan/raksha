/**
 * Configure ElevenLabs intake agent for:
 *   - /app browser (client tools)
 *   - PSTN call to +16055999677 (webhook tools → Render Core)
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const envLocalPath = join(process.cwd(), ".env.local");
const envContent = readFileSync(envLocalPath, "utf-8");

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : process.env[key];
}

const apiKey = getEnv("ELEVENLABS_API_KEY");
const agentId = getEnv("ELEVENLABS_INTAKE_AGENT_ID");
const webhookBase = (
  getEnv("PROTOCOL_PUBLIC_ORIGIN") ||
  process.env.PROTOCOL_PUBLIC_ORIGIN ||
  "https://raksha-protocol.onrender.com"
).replace(/\/$/, "");
const toolUrl = `${webhookBase}/phone/elevenlabs/tool`;

if (!apiKey || !agentId) {
  console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_INTAKE_AGENT_ID in .env.local");
  process.exit(1);
}

const systemPrompt = `You are Raksha — an emergency first-responder for Indian financial cyber-fraud reporting (1930 Cyber Cell and bank freeze).

You share one Civic Action Protocol with the Raksha website and WhatsApp. The caller's phone number is the case key. If they already reported on the website or WhatsApp, look up that same case — do not start a duplicate.

LANGUAGE:
- If they speak English, stay in English. If Hindi, stay in Hindi/Hinglish. If Tamil, stay in Tamil.
- Do not switch languages mid-call.

PACING:
- After a question, WAIT. Do not say "are you still there?" quickly.
- Never cut them off. Ask one short question at a time.

FLOW:
1. Empathize briefly.
2. If they ask for STATUS / tracking / meri report, call raksha_get_status first.
3. Otherwise understand the scam, then collect only missing facts: amount, bank, 12-digit UTR.
4. Read back facts and ask them to confirm.
5. On a phone call the 12-digit UTR is the proof. Never ask for a screenshot. Never file from "I got scammed" alone.
6. After they confirm amount + bank + 12-digit UTR, call raksha_submit_incident.
7. Only then speak the tracking reference. Never invent a UTR, amount, bank, RKS id, or 1930 number.

TOOLS — you MUST call these; do not pretend you filed:
- raksha_start_incident: first fraud story.
- raksha_process_input: follow-ups, UTR, "yes", missing fields.
- raksha_get_status: status / tracking / continue an existing report.
- raksha_submit_incident: only after explicit confirmation AND you have amount + 12-digit UTR.

Never ask for OTP, UPI PIN, or passwords. Never say the bank is already frozen.`;

function webhookTool(name, description, llmFields, required) {
  const properties = {
    tool_name: { type: "string", constant_value: name },
    caller_id: { type: "string", dynamic_variable: "system__caller_id" },
    conversation_id: { type: "string", dynamic_variable: "system__conversation_id" },
    ...llmFields,
  };
  return {
    type: "webhook",
    name,
    description,
    api_schema: {
      url: toolUrl,
      method: "POST",
      request_body_schema: {
        type: "object",
        description: `${name} payload for Raksha Core`,
        properties,
        required,
      },
    },
  };
}

const webhookTools = [
  webhookTool(
    "raksha_start_incident",
    "Start or resume the citizen's emergency fraud report from their spoken story. Always pass the full narrative. Uses the caller's phone number as the shared case key with website and WhatsApp.",
    {
      narrative: { type: "string", description: "What the citizen said happened" },
      language: { type: "string", description: "en, hi, or ta" },
    },
    ["narrative"]
  ),
  webhookTool(
    "raksha_process_input",
    "Send a follow-up utterance: UTR, amount, bank, yes/confirm, or more story. Use this for every turn after the first story.",
    {
      userSpeech: { type: "string", description: "Exactly what the citizen just said" },
      incidentId: { type: "string", description: "RKS-* if you already have it" },
      isConfirmation: { type: "boolean", description: "True if they confirmed the details" },
      language: { type: "string", description: "en, hi, or ta" },
    },
    ["userSpeech"]
  ),
  webhookTool(
    "raksha_get_status",
    "Look up the existing report for this caller (same mobile as website or WhatsApp). Use when they ask for status, tracking, or continue.",
    {
      incidentId: { type: "string", description: "RKS-* if known" },
    },
    []
  ),
  webhookTool(
    "raksha_submit_incident",
    "File the emergency freeze to 1930 and the bank after the citizen explicitly confirms AND amount + 12-digit UTR exist. Do not call this without confirmation.",
    {
      confirmedByCitizen: { type: "boolean", description: "Must be true" },
      incidentId: { type: "string", description: "RKS-* if known" },
      language: { type: "string", description: "en, hi, or ta" },
    },
    ["confirmedByCitizen"]
  ),
];

const clientTools = [
  {
    type: "client",
    name: "raksha_start_incident_web",
    description: "Browser /app only. Start a report from the website voice session.",
    parameters: {
      type: "object",
      required: ["narrative"],
      properties: {
        narrative: { type: "string", description: "What happened" },
      },
    },
  },
];

const updatePayload = {
  name: "Raksha Emergency Cyber-Fraud First Responder",
  conversation_config: {
    asr: {
      quality: "high",
      provider: "scribe_realtime",
      user_input_audio_format: "pcm_16000",
    },
    tts: {
      model_id: "eleven_turbo_v2",
      voice_id: "21m00Tcm4TlvDq8ikWAM",
      agent_output_audio_format: "pcm_16000",
    },
    turn: {
      turn_timeout: 30,
      turn_eagerness: "patient",
      silence_end_call_timeout: -1,
      soft_timeout_config: { timeout_seconds: -1 },
    },
    agent: {
      first_message:
        "Hello, this is Raksha, the emergency cyber fraud helpline. Please don't worry. Tell me what happened, or say status if you already filed a report.",
      language: "en",
      prompt: {
        prompt: systemPrompt,
        llm: "gpt-4o-mini",
        tools: [...webhookTools, ...clientTools],
      },
    },
  },
  platform_settings: {
    overrides: {
      conversation_config_override: {
        agent: {
          first_message: true,
          language: true,
          prompt: { prompt: true },
        },
        tts: { model_id: true },
      },
    },
  },
};

async function configureElevenLabsAgent() {
  console.log(`Configuring ElevenLabs Agent [${agentId}]`);
  console.log(`PSTN webhook: ${toolUrl}`);
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatePayload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Failed to update ElevenLabs Agent: HTTP ${res.status} - ${errText}`);
    process.exit(1);
  }

  const data = await res.json();
  const tools = data.conversation_config?.agent?.prompt?.tools || [];
  console.log("Agent:", data.name);
  console.log("First message:", data.conversation_config?.agent?.first_message);
  console.log(
    "Tools:",
    tools.map((t) => `${t.type}:${t.name}`).join(", ") || "(none returned)"
  );
}

configureElevenLabsAgent().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
