import fs from "node:fs";

const envLocal = fs.readFileSync(".env.local", "utf-8");
function getEnv(k) {
  const m = envLocal.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : process.env[k];
}

const accountSid = getEnv("TWILIO_ACCOUNT_SID");
const authToken = getEnv("TWILIO_AUTH_TOKEN");
const fromNumber = getEnv("TWILIO_FROM_NUMBER") || "+16055999677";

export async function callNumber(toNumber) {
  if (!toNumber) {
    console.error("Usage: node scripts/trigger-call.mjs <toNumber>");
    process.exit(1);
  }

  console.log(`Initiating Twilio call from ${fromNumber} to ${toNumber}...`);
  
  // TwiML that connects directly to the ElevenLabs agent
  const twiml = `<Response><Connect><Stream url="wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent_1201kxw5b2fvearadb4p3brmtya9" /></Connect></Response>`;

  const body = new URLSearchParams({
    To: toNumber,
    From: fromNumber,
    Twiml: twiml
  });

  const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const data = await res.json();
  if (res.ok) {
    console.log("✅ Call initiated successfully!");
    console.log("Call SID:", data.sid);
    console.log("Status:", data.status);
  } else {
    console.error("❌ Twilio Error:", data);
  }
}

const target = process.argv[2];
if (target) {
  callNumber(target);
}
