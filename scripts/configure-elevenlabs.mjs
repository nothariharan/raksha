/**
 * Configure ElevenLabs Conversational Voice AI Agent for Raksha Protocol
 * Sets up the empathetic Hindi/English First Responder Agent with tools and system prompt.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const envLocalPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envLocalPath, 'utf-8');

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : process.env[key];
}

const apiKey = getEnv('ELEVENLABS_API_KEY');
const agentId = getEnv('ELEVENLABS_INTAKE_AGENT_ID');

if (!apiKey || !agentId) {
  console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_INTAKE_AGENT_ID in .env.local');
  process.exit(1);
}

const systemPrompt = `You are Raksha — an emergency first-responder AI assistant for Indian financial cyber-fraud reporting (1930 Cyber Cell & Bank Freeze Protocol).

You talk to the citizen like an empathetic, calm, caring friend who understands cybercrime in India.

LANGUAGE LOCK (HIGHEST PRIORITY):
- The session language override (en / hi / ta) is absolute for the ENTIRE call.
- Never switch languages mid-conversation. Do not greet in Hindi if language is English.
- If language is en: speak ONLY clear English. If hi: Hindi/Hinglish only. If ta: Tamil only.
- Even if the citizen mixes languages, your replies stay in the locked session language.

PACING (CRITICAL):
- After you ask a question, WAIT. Citizens often need 15–30 seconds to think and speak.
- Do NOT say "Are you still there?", "Hello?", or similar idle nudges unless they have been silent for a very long time after you finished speaking.
- Never interrupt or cut off the citizen mid-sentence. Let them finish fully before you reply.
- Ask one short question at a time.

YOUR CONVERSATIONAL GOAL & DYNAMIC FLOW:
1. EMPATHIZE & CALM — brief reassurance in the locked language.
2. UNDERSTAND THE SCAM TYPE FIRST — do not jump straight to amount/UTR.
   Ask what kind of scam this was and how it started (loan, digital arrest, KYC, fake customer care, etc.).
3. Then collect only MISSING payment facts (amount, bank, 12-digit UTR) — one question at a time.
4. VERIFY & EXPLICIT CONFIRMATION — read back facts and ask the citizen to confirm.
5. On a call, the 12-digit UTR is the proof. Do not ask for a screenshot. Do not file if they only said they were scammed.
6. Only after amount + 12-digit UTR + confirmation, give the tracking reference. Never invent a case ID or payment facts.

Do NOT robotically re-ask the same three money questions if the citizen already answered them.
Never claim the bank account is already frozen.

CRITICAL SAFETY & TRUTHFULNESS RULES:
- Never say "your bank has been frozen" (it is an emergency freeze request / simulated handoff).
- Never ask for OTP, UPI PIN, or NetBanking passwords.
- Always require explicit citizen confirmation before submitting the final freeze packet.
- Keep latency low, pauses natural, and sentences concise.`;

const firstMessage = 'नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?';

const updatePayload = {
  name: 'Raksha Emergency Cyber-Fraud First Responder',
  conversation_config: {
    asr: {
      quality: 'high',
      provider: 'scribe_realtime',
      user_input_audio_format: 'pcm_16000'
    },
    tts: {
      model_id: 'eleven_turbo_v2_5',
      voice_id: '21m00Tcm4TlvDq8ikWAM',
      agent_output_audio_format: 'pcm_16000'
    },
    // Give citizens time to think and finish speaking before re-prompting.
    // turn_timeout max is 30s; "patient" reduces mid-sentence cutoffs.
    turn: {
      turn_timeout: 30,
      turn_eagerness: 'patient',
      silence_end_call_timeout: -1,
      soft_timeout_config: {
        timeout_seconds: -1
      }
    },
    agent: {
      first_message: firstMessage,
      language: 'hi',
      prompt: {
        prompt: systemPrompt,
        llm: 'gpt-4o-mini',
        tools: [
          {
            type: 'client',
            name: 'raksha_start_incident',
            description: 'Start a new emergency cyber fraud report from citizen narrative.',
            parameters: {
              type: 'object',
              required: ['narrative'],
              properties: {
                narrative: { type: 'string', description: 'What happened in the fraud' },
                amount: { type: 'number', description: 'Amount in INR if mentioned' },
                channel: { type: 'string', description: 'UPI, CARD, NETBANKING' },
                bank: { type: 'string', description: 'Debited bank name' },
                language: { type: 'string', description: 'hi or en' }
              }
            }
          },
          {
            type: 'client',
            name: 'raksha_process_input',
            description: 'Process follow-up details from citizen (such as UTR or scam details).',
            parameters: {
              type: 'object',
              required: ['userSpeech'],
              properties: {
                userSpeech: { type: 'string', description: 'Follow-up spoken details' },
                incidentId: { type: 'string', description: 'Active incident ID' },
                language: { type: 'string', description: 'hi or en' }
              }
            }
          },
          {
            type: 'client',
            name: 'raksha_submit_incident',
            description: 'Submit verified fraud freeze packet to CAP after explicit citizen confirmation.',
            parameters: {
              type: 'object',
              required: ['confirmedByCitizen'],
              properties: {
                confirmedByCitizen: { type: 'boolean', description: 'Must be true' },
                incidentId: { type: 'string', description: 'Incident ID' },
                language: { type: 'string', description: 'hi or en' }
              }
            }
          }
        ]
      }
    }
  },
  // Allow /app to override greeting + language + TTS model per citizen choice.
  platform_settings: {
    overrides: {
      conversation_config_override: {
        agent: {
          first_message: true,
          language: true,
          prompt: { prompt: true }
        },
        tts: {
          model_id: true
        }
      }
    }
  }
};

async function configureElevenLabsAgent() {
  console.log(`Configuring ElevenLabs Agent [${agentId}]...`);
  const res = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
    method: 'PATCH',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatePayload)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Failed to update ElevenLabs Agent: HTTP ${res.status} - ${errText}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log('✅ ElevenLabs Agent successfully updated!');
  console.log('Agent Name:', data.name || 'Raksha Emergency Cyber-Fraud First Responder');
  console.log('LLM:', data.conversation_config?.agent?.prompt?.llm);
  console.log('First Message:', data.conversation_config?.agent?.first_message);
}

configureElevenLabsAgent().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
