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
const branchId = getEnv("ELEVENLABS_AGENT_BRANCH_ID") || "agtbrch_8301kxw5b319e71bxs1maah8xw9f";
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

LANGUAGE — first user turn only:
- Default is English. Your first line already asked English, Hindi, or Tamil.
- If they pick English (or "English is fine"): do NOT call any tool. Speak immediately: stay in English, then ask what happened or if they want status.
- If they pick Hindi or Tamil: call language_detection once (hi or ta), then speak in that language and ask what happened. Do not call raksha_* yet.
- Never call raksha_process_input, raksha_start_incident, or raksha_get_status for a language answer.
- After language is set, pass language (en, hi, or ta) on later raksha_* calls only.

PACING:
- After a question, WAIT. Do not say "are you still there?" quickly.
- Never cut them off. Ask one short question at a time.

FLOW (only after language is set):
1. Empathize briefly.
2. If they ask for STATUS / tracking / meri report, call raksha_get_status first.
3. Otherwise understand the scam, then collect only missing facts: amount, bank, 12-digit UTR.
4. Read back facts and ask them to confirm.
5. On a phone call the 12-digit UTR is the proof. Never ask for a screenshot. Never file from "I got scammed" alone.
6. After they confirm amount + bank + 12-digit UTR, call raksha_submit_incident.
7. Only then speak the tracking reference. Never invent a UTR, amount, bank, RKS id, or 1930 number.

TOOLS — you MUST call these; do not pretend you filed:
- language_detection: only when switching away from English to Hindi or Tamil.
- raksha_start_incident: first fraud story, never a language pick.
- raksha_process_input: follow-ups after a story exists (UTR, amount, yes). Never language picks.
- raksha_get_status: status / tracking / continue an existing report.
- raksha_submit_incident: only after explicit confirmation AND you have amount + 12-digit UTR.

Never ask for OTP, UPI PIN, or passwords. Never say the bank is already frozen.`;

function webhookTool(name, description, llmFields, required) {
  const properties = {
    tool_name: { type: "string", constant_value: name },
    caller_id: { type: "string", dynamic_variable: "system__caller_id" },
    system__user_id: { type: "string", dynamic_variable: "system__user_id" },
    system__called_number: { type: "string", dynamic_variable: "system__called_number" },
    conversation_id: { type: "string", dynamic_variable: "system__conversation_id" },
    ...llmFields,
    parameters: {
      type: "object",
      description: "Same fields nested for the current Render phone adapter",
      properties: llmFields,
    },
  };
  return {
    type: "webhook",
    name,
    description,
    response_timeout_secs: 45,
    disable_interruptions: true,
    force_pre_tool_speech: name === "raksha_start_incident",
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
    "Follow-up after a fraud story exists: UTR, amount, bank, yes/confirm, or more story. Never use this for language selection (English/Hindi/Tamil).",
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
      user_input_audio_format: "ulaw_8000",
    },
    tts: {
      model_id: "eleven_turbo_v2",
      voice_id: "21m00Tcm4TlvDq8ikWAM",
      agent_output_audio_format: "ulaw_8000",
    },
    turn: {
      turn_timeout: 12,
      turn_eagerness: "patient",
      silence_end_call_timeout: -1,
      soft_timeout_config: {
        timeout_seconds: 6,
        message: "Take your time. I'm listening.",
      },
    },
    conversation: {
      text_only: false,
      max_duration_seconds: 300,
      client_events: [
        "conversation_initiation_metadata",
        "audio",
        "interruption",
        "user_transcript",
        "tentative_user_transcript",
        "agent_response",
        "agent_response_complete",
      ],
    },
    agent: {
      first_message:
        "Hello, this is Raksha, the emergency cyber fraud helpline. Which language are you comfortable in — English, Hindi, or Tamil?",
      language: "en",
      hinglish_mode: true,
      disable_first_message_interruptions: true,
      prompt: {
        prompt: systemPrompt,
        llm: "gpt-4o-mini",
        tools: [...webhookTools, ...clientTools],
        built_in_tools: {
          language_detection: {
            type: "system",
            name: "language_detection",
            description:
              "Switch spoken output to Hindi or Tamil. Do not call this when they choose English. Never use a raksha_* webhook for language selection.",
            params: {
              system_tool_type: "language_detection",
              only_at_conversation_start: true,
            },
          },
        },
      },
    },
    language_presets: {
      hi: {
        overrides: {
          agent: {
            language: "hi",
            first_message:
              "नमस्ते, मैं रक्षा हूँ, साइबर धोखाधड़ी हेल्पलाइन। आप किस भाषा में बात करना चाहते हैं — अंग्रेज़ी, हिंदी, या तमिल?",
          },
        },
      },
      ta: {
        overrides: {
          agent: {
            language: "ta",
            first_message:
              "வணக்கம், நான் ரக்ஷா, சைபர் மோசடி உதவி எண். நீங்கள் எந்த மொழியில் பேச விரும்புகிறீர்கள் — ஆங்கிலம், இந்தி, அல்லது தமிழ்?",
          },
        },
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
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${agentId}?branch_id=${encodeURIComponent(branchId)}`,
    {
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
  const builtIns = data.conversation_config?.agent?.prompt?.built_in_tools || {};
  console.log("Agent:", data.name);
  console.log("Language:", data.conversation_config?.agent?.language);
  console.log("TTS model:", data.conversation_config?.tts?.model_id);
  console.log("First message:", data.conversation_config?.agent?.first_message);
  console.log("Language presets:", Object.keys(data.conversation_config?.language_presets || {}).join(", ") || "(none)");
  console.log(
    "Tools:",
    tools.map((t) => `${t.type}:${t.name}`).join(", ") || "(none returned)"
  );
  console.log("Built-in tools:", Object.keys(builtIns).join(", ") || "(none)");
  console.log(
    "Client events:",
    (data.conversation_config?.conversation?.client_events || []).join(", ") || "(none)"
  );
}

configureElevenLabsAgent().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
