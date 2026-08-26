import fs from "node:fs";

const envLocal = fs.readFileSync(".env.local", "utf-8");
function getEnv(k) {
  const m = envLocal.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : process.env[k];
}

const accountSid = getEnv("TWILIO_ACCOUNT_SID");
const authToken = getEnv("TWILIO_AUTH_TOKEN");
const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

async function sendWhatsApp(toNumber, text) {
  console.log(`Sending WhatsApp message to ${toNumber}...`);
  
  const from = "whatsapp:+14155238886";
  const body = new URLSearchParams({
    To: `whatsapp:${toNumber}`,
    From: from,
    Body: text
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`✅ WhatsApp message dispatched to ${toNumber}! SID: ${data.sid}`);
  } else {
    console.error(`❌ Twilio Error:`, data);
  }
  return data;
}

const msg = "🛡️ *रक्षा आपातकालीन साइबर हेल्पलाइन (Raksha Helpline)*\n\nनमस्ते रमेश जी, क्या आपके खाते से कोई अनधिकृत लेन-देन (Fraud) हुआ है?\n\nअपनी शिकायत दर्ज करने के लिए विवरण (राशि, बैंक, UTR नंबर) लिखें या लेन-देन का स्क्रीनशॉट यहाँ भेजें।";

const target = process.argv[2] || "+918056135790";
sendWhatsApp(target, msg);
