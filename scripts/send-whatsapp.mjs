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
  console.log(`Sending WhatsApp Confirmation Report to ${toNumber}...`);
  
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
    console.log(`✅ WhatsApp Report dispatched to ${toNumber}! SID: ${data.sid}`);
  } else {
    console.error(`❌ Twilio Error:`, data);
  }
  return data;
}

const confirmationReport = `🚨 *रक्षा आपातकालीन साइबर हेल्पलाइन — मामला सारांश*
------------------------------------------------
📌 *केस संदर्भ:* RKS-DEMO-001
👤 *शिकायतकर्ता:* Ramesh Kumar
💰 *धोखाधड़ी राशि:* ₹5,000
📱 *माध्यम:* UPI (PhonePe)
🏦 *डेबिट बैंक:* State Bank of India
🔢 *12-अंकीय UTR:* 423456789012
⚖️ *मामला:* बिजली बिल धोखाधड़ी (Electricity Bill Scam)
------------------------------------------------
⚡ *आपकी अनुमति आवश्यक है:*
क्या आप इस रिपोर्ट को राष्ट्रीय साइबर हेल्पलाइन (*1930*) एवं *SBI बैंक नोडल अधिकारी* को तत्काल खाता-फ्रीज़ (Lien) हेतु अग्रेषित करने की अनुमति देते हैं?

👉 सहमति देने के लिए केवल *'कन्फर्म'* (या *CONFIRM*) लिखकर भेजें।`;

const target = process.argv[2] || "+918056135790";
sendWhatsApp(target, confirmationReport);
