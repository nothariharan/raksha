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
  
  const twiml = `<Response>
  <Say voice="Polly.Aditi" language="hi-IN">नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए।</Say>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="hi-IN">मैंने आपका विवरण दर्ज कर लिया है: पांच हज़ार रुपये, स्टेट बैंक ऑफ़ इंडिया, यू टी आर चार दो तीन चार पांच छह सात आठ नौ शून्य एक दो।</Say>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="hi-IN">आपकी आपातकालीन रिपोर्ट राष्ट्रीय साइबर हेल्पलाइन एक नौ तीन शून्य और बैंक को भेज दी गई है।</Say>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="hi-IN">धन्यवाद। रक्षा आपकी सुरक्षा में सदैव तत्पर है।</Say>
</Response>`;

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
