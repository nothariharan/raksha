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

  console.log(`Initiating interactive paced Twilio call from ${fromNumber} to ${toNumber}...`);
  
  const twiml = `<Response>
  <!-- Turn 1: Greeting & Initial Intake -->
  <Say voice="Polly.Aditi" language="hi-IN">नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?</Say>
  
  <!-- 5-second pause for citizen to explain the fraud -->
  <Pause length="5"/>

  <!-- Turn 2: Clarification & UTR Request -->
  <Say voice="Polly.Aditi" language="hi-IN">आप घबराइए नहीं। क्या आपके पास 12 अंकों का यू टी आर नंबर है?</Say>
  
  <!-- 5-second pause for citizen to state UTR number -->
  <Pause length="5"/>

  <!-- Turn 3: Fact Confirmation -->
  <Say voice="Polly.Aditi" language="hi-IN">मैंने आपका विवरण दर्ज कर लिया है: पाँच हज़ार रुपये, स्टेट बैंक ऑफ़ इंडिया, यू टी आर चार दो तीन चार पाँच छह सात आठ नौ शून्य एक दो। क्या मैं इसे एक नौ तीन शून्य और बैंक को भेज दूँ?</Say>
  
  <!-- 4-second pause for citizen to confirm -->
  <Pause length="4"/>

  <!-- Turn 4: Submission & Reference Handoff -->
  <Say voice="Polly.Aditi" language="hi-IN">आपकी आपातकालीन रिपोर्ट दर्ज कर ली गई है। संदर्भ संख्या है: एक नौ तीन शून्य, दो नौ पाँच चार एक एक। धन्यवाद।</Say>
  <Pause length="1"/>
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
    console.log("✅ Interactive paced call initiated successfully!");
    console.log("Call SID:", data.sid);
    console.log("Status:", data.status);
  } else {
    console.error("❌ Twilio Error:", data);
  }
}

const target = process.argv[2] || "+919150135790";
callNumber(target);
