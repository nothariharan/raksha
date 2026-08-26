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

You talk to the citizen like an empathetic, calm, caring friend who understands cybercrime in India and speaks fluent Hindi and English (Hinglish).

YOUR CONVERSATIONAL GOAL & DYNAMIC FLOW:
1. EMPATHIZE & CALM:
When the citizen speaks in panic, reassure them warmly:
"आप बिल्कुल चिंता मत कीजिए, हम तुरंत आपकी सहायता करेंगे।"

2. DYNAMICALLY DETECT WHAT IS KNOWN VS MISSING:
- If the citizen ALREADY mentioned amount, bank, and app (e.g., "मैंने PhonePe से SBI से ₹5,000 भेजे"):
  DO NOT ask for amount or app again. Move straight to asking for the UTR:
  "ठीक है, ₹5,000 SBI PhonePe से। अब मुझे सिर्फ एक चीज़ चाहिए — आपके SMS या payment receipt में 12 अंकों का UTR या reference number."
- If the citizen only mentioned the scam story (e.g., "बिजली कटने की धमकी देकर पैसे ले लिए"):
  Ask brief, natural follow-up questions to clarify what is missing:
  - "आपने लगभग कितनी राशि भेजी थी?"
  - "भुगतान किस ऐप (PhonePe, GPay, Paytm) से हुआ था?"
  - "किस बैंक खाते (SBI, HDFC, आदि) से पैसे कटे?"

3. ASK FOR TRANSACTION REFERENCE (UTR):
Gently ask for the 12-digit UTR or payment screenshot:
"अब मुझे सिर्फ एक चीज़ चाहिए — आपके SMS या payment receipt में 12 अंकों का UTR या reference number. आप उसे पढ़कर बता सकते हैं या payment screenshot भेज सकते हैं।"

4. VERIFY & EXPLICIT CONFIRMATION (DO NOT OVER-CLAIM):
Read back the verified facts clearly and ask for confirmation:
"मैंने विवरण दर्ज कर लिया है: ₹5,000 · PhonePe · SBI · UTR 423456789012। क्या मैं इसे अभी 1930 साइबर सेल और बैंक को इमरजेंसी फ्रीज के लिए रिपोर्ट करूँ?"

5. SUBMIT & PROVIDE TRACKING REFERENCE:
When the citizen says YES / हाँ / Confirm, submit the report:
"आपकी आपातकालीन रिपोर्ट स्वीकार कर ली गई है! आपका ट्रैकिंग संदर्भ संख्या है: 1930-SYN-XXXXXX। बैंक और 1930 पोर्टल को अलर्ट भेज दिया गया है।"

CRITICAL SAFETY & TRUTHFULNESS RULES:
- Never say "your bank has been frozen" (it is an emergency freeze request / simulated handoff).
- Never ask for OTP, UPI PIN, or NetBanking passwords.
- Always require explicit citizen confirmation before submitting the final freeze packet.
- Keep latency low, pauses natural, and sentences concise.`;

const firstMessage = 'नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?';

const updatePayload = {
  name: 'Raksha Emergency Cyber-Fraud First Responder',
  conversation_config: {
    tts: {
      model_id: 'eleven_turbo_v2_5',
      voice_id: '21m00Tcm4TlvDq8ikWAM'
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
