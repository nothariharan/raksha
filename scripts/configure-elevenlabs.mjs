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
1. If they ask for STATUS / tracking / meri report / "I already reported" / "what happened to my report" / escalate / follow up / chase my report, call raksha_get_status first, then speak the tool result word for word.
2. If the status tool asks whether they want to follow up, and they say yes / escalate / follow up / please do, call raksha_follow_up with authorizedByCitizen=true. Speak the tool result. Do not invent a reference.
2b. If they clearly ask to escalate or follow up on an already-filed case (even if status did not offer it), confirm once ("I can send a citizen follow-up on the same case — should I?"), then on yes call raksha_follow_up with authorizedByCitizen=true.
3. When they describe a scam, you MUST call raksha_start_incident in THAT SAME TURN with their full story. Do not ask the next question until the tool returns. Then speak only the tool result.
4. When they give amount, bank, or UTR, call raksha_process_input in that same turn, then speak only the tool result.
5. A UTR must be exactly 12 digits. If they give fewer or more, do not confirm it. Ask them to read all 12 digits from the bank SMS.
6. Never ask for a screenshot. Never file from "I got scammed" alone.
7. After they say yes/correct AND the last tool said the 12-digit UTR is recorded, call raksha_submit_incident with confirmedByCitizen=true, the incidentId from the tool if you have it, and a summary of what happened + amount + bank + the 12-digit UTR.
8. After submit, speak the tool result word for word. That is the close — thank you, filed, official cyber crime portal, report number. Do not invent a reference number.

TOOLS — you MUST call these; do not pretend you filed:
- language_detection: only when switching away from English to Hindi or Tamil.
- raksha_start_incident: first fraud story, in the same turn they tell it. Never a language pick.
- raksha_process_input: follow-ups after a story exists (UTR, amount, yes). Never language picks. Never use for follow-up after STATUS offered it.
- raksha_get_status: status / tracking / already reported / meri report / escalate / chase / continue an existing report.
- raksha_follow_up: after STATUS offered follow-up and the citizen says yes / escalate / follow up. Always authorizedByCitizen=true. This is citizen-authorized follow-up on the same case — never invent institutional failure.
- raksha_submit_incident: only after explicit confirmation of a new report. Always pass a summary of the confirmed facts so the report can still be filed if an earlier tool was missed.

Never ask for OTP, UPI PIN, or passwords. Never say the bank is already frozen. In speech prefer "follow up" over "escalate"; if the caller says escalate, treat it as follow-up on the same case.`;

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
    force_pre_tool_speech: name === "raksha_start_incident" || name === "raksha_submit_incident",
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
    "Call this in the same turn as the first fraud story. Pass the full spoken narrative. Do not ask follow-up questions before this tool returns.",
    {
      narrative: { type: "string", description: "What the citizen said happened" },
      language: { type: "string", description: "en, hi, or ta" },
    },
    ["narrative"]
  ),
  webhookTool(
    "raksha_process_input",
    "Call this in the same turn they give UTR, amount, bank, or yes/confirm. Never use this for language selection. A UTR must be exactly 12 digits.",
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
    "Look up the existing report for this caller. Use for STATUS, tracking, meri report, already reported, what happened to my report, escalate, or chase my report. Speak the tool result word for word.",
    {
      incidentId: { type: "string", description: "RKS-* if known" },
      language: { type: "string", description: "en, hi, or ta" },
    },
    []
  ),
  webhookTool(
    "raksha_follow_up",
    "Citizen-authorized follow-up after STATUS offered it and they said yes / escalate / follow up. Never call without explicit confirmation. Never invent institutional failure.",
    {
      authorizedByCitizen: { type: "boolean", description: "Must be true" },
      incidentId: { type: "string", description: "RKS-* if known" },
      language: { type: "string", description: "en, hi, or ta" },
    },
    ["authorizedByCitizen"]
  ),
  webhookTool(
    "raksha_submit_incident",
    "File the emergency report after the citizen explicitly confirms. Always pass a summary of the story, amount, bank, and 12-digit UTR. Speak the tool result as the closing line.",
    {
      confirmedByCitizen: { type: "boolean", description: "Must be true" },
      summary: {
        type: "string",
        description: "Confirmed story plus amount, bank, and 12-digit UTR so the report can still be filed",
      },
      incidentId: { type: "string", description: "RKS-* if known" },
      language: { type: "string", description: "en, hi, or ta" },
    },
    ["confirmedByCitizen", "summary"]
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
