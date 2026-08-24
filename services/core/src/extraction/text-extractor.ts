/**
 * Text Narrative Extractor
 * Extracts candidate financial fraud details from unstructured citizen messages, SMS, or transcripts.
 */

import { ExtractedFraudCandidate, ExtractionInput, FraudCategory } from "./extraction-types.js";

export class TextExtractor {
  static extract(input: ExtractionInput): ExtractedFraudCandidate {
    const text = input.content.trim();
    const sourceId = input.sourceId || "text#1";
    const confidence: Record<string, number> = {};
    const sourceRefs: Record<string, string[]> = {};

    let amount: number | undefined;
    let fraudCategory: FraudCategory = "OTHER";
    let channel: "UPI" | "CARD" | "BANK_TRANSFER" | "WALLET" | "OTHER" = "UPI";
    let application: string | undefined;
    let transactionId: string | null = null;
    let debitInstitution: string | null = null;
    let beneficiaryIdentifier: string | null = null;

    // 1. Amount Extraction (₹5000, Rs 5000, 5,000 rupees, 50k, etc.)
    const amountRegex = /(?:rs\.?|inr|₹|\bamount\b|\bpaid\b|\bsent\b|\blost\b)\s*[:=]?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{2})?|\d+k)/i;
    const directNumberMatch = text.match(amountRegex);
    if (directNumberMatch && directNumberMatch[1]) {
      let rawVal = directNumberMatch[1].toLowerCase().replace(/,/g, "");
      if (rawVal.endsWith("k")) {
        amount = parseFloat(rawVal.slice(0, -1)) * 1000;
      } else {
        amount = parseFloat(rawVal);
      }
      confidence.amount = 0.92;
      sourceRefs.amount = [sourceId];
    } else {
      // Word-based numbers across English, Hindi, Hinglish
      if (/seventy\s*five\s*thousand|75000|pachattar\s*hazar|पचहत्तर\s*हज़ार/i.test(text)) {
        amount = 75000;
        confidence.amount = 0.95;
        sourceRefs.amount = [sourceId];
      } else if (/fifty\s*thousand|50000|50k|pachaas\s*hazar|पचास\s*हज़ार/i.test(text)) {
        amount = 50000;
        confidence.amount = 0.95;
        sourceRefs.amount = [sourceId];
      } else if (/five\s*thousand|5000|5k|paanch\s*hazar|पाँच\s*हज़ार|5\s*हज़ार/i.test(text)) {
        amount = 5000;
        confidence.amount = 0.95;
        sourceRefs.amount = [sourceId];
      } else if (/ten\s*thousand|10000|10k|das\s*hazar|दस\s*हज़ार/i.test(text)) {
        amount = 10000;
        confidence.amount = 0.95;
        sourceRefs.amount = [sourceId];
      } else {
        // Any raw 4-7 digit number mentioned in text as fallback amount
        const anyNumberMatch = text.match(/\b([1-9][0-9]{2,6})\b/);
        if (anyNumberMatch && anyNumberMatch[1]) {
          const val = parseFloat(anyNumberMatch[1]);
          if (val >= 100 && val <= 10000000 && !/^\d{12}$/.test(anyNumberMatch[1])) {
            amount = val;
            confidence.amount = 0.85;
            sourceRefs.amount = [sourceId];
          }
        }
      }
    }

    // 2. Application & Channel Detection (Multilingual: English, Devanagari, Tamil, etc.)
    if (/phonepe|phone\s*pe|फ़ोनपे|फोनपे|போன்பே|ఫోన్‌పే|ಫೋನ್‍ಪೇ|ফোনপে/i.test(text)) {
      application = "PhonePe";
      channel = "UPI";
      confidence.application = 0.95;
      confidence.channel = 0.98;
      sourceRefs.application = [sourceId];
      sourceRefs.channel = [sourceId];
    } else if (/google\s*pay|gpay|g\s*pay|गूगल\s*पे|கூகுள்\s*பே|గూగుల్\s*పే|ಗೂಗಲ್\s*ಪೇ|গুগল\s*পে/i.test(text)) {
      application = "Google Pay";
      channel = "UPI";
      confidence.application = 0.95;
      confidence.channel = 0.98;
      sourceRefs.application = [sourceId];
      sourceRefs.channel = [sourceId];
    } else if (/paytm|पेटीएम|பேடிஎம்|పేటీఎం|ಪೇಟಿಎಂ|পেটিএম/i.test(text)) {
      application = "Paytm";
      channel = "UPI";
      confidence.application = 0.95;
      confidence.channel = 0.98;
      sourceRefs.application = [sourceId];
      sourceRefs.channel = [sourceId];
    } else if (/bhim|भीम|பீம்|భీమ్|ಭೀಮ್/i.test(text)) {
      application = "BHIM";
      channel = "UPI";
      confidence.application = 0.95;
      confidence.channel = 0.98;
      sourceRefs.application = [sourceId];
      sourceRefs.channel = [sourceId];
    } else if (/cred/i.test(text)) {
      application = "CRED";
      channel = "UPI";
      confidence.application = 0.95;
      confidence.channel = 0.98;
      sourceRefs.application = [sourceId];
      sourceRefs.channel = [sourceId];
    } else if (/upi|vpa|यूपीआई/i.test(text)) {
      channel = "UPI";
      confidence.channel = 0.9;
      sourceRefs.channel = [sourceId];
    } else if (/credit\s*card|debit\s*card|card|क्रेडिट\s*कार्ड|डेबिट\s*कार्ड/i.test(text)) {
      channel = "CARD";
      confidence.channel = 0.85;
      sourceRefs.channel = [sourceId];
    } else if (/net\s*banking|neft|rtgs|imps|bank\s*transfer|नेट\s*बैंकिंग/i.test(text)) {
      channel = "BANK_TRANSFER";
      confidence.channel = 0.85;
      sourceRefs.channel = [sourceId];
    }

    // 3. Fraud Category Recognition
    if (/electricity|power\s*bill|bijli|bijlee|meter|bill\s*unpaid|बिजली|மின்சாரம்|విద్యుత్|ವಿದ್ಯುತ್|বিদ্যুৎ|वीज/i.test(text)) {
      fraudCategory = "ELECTRICITY_BILL_SCAM";
      confidence.fraudCategory = 0.94;
      sourceRefs.fraudCategory = [sourceId];
    } else if (/digital\s*arrest|cbi|police|customs|narcotics|dhl|parcel|डिजिटल\s*अरेस्ट|पुलिस/i.test(text)) {
      fraudCategory = "DIGITAL_ARREST";
      confidence.fraudCategory = 0.96;
      sourceRefs.fraudCategory = [sourceId];
    } else if (/task|telegram\s*job|like\s*video|part\s*time\s*job|rating|टास्क|पार्ट\s*टाइम/i.test(text)) {
      fraudCategory = "TASK_SCAM";
      confidence.fraudCategory = 0.92;
      sourceRefs.fraudCategory = [sourceId];
    } else if (/kyc|sim\s*block|account\s*blocked|pan\s*card|केवाईसी/i.test(text)) {
      fraudCategory = "KYC_UPDATE_FRAUD";
      confidence.fraudCategory = 0.91;
      sourceRefs.fraudCategory = [sourceId];
    } else if (/customer\s*care|helpline|support\s*number|कस्टमर\s*केयर|हेल्पलाइन/i.test(text)) {
      fraudCategory = "CUSTOMER_CARE_IMPERSONATION";
      confidence.fraudCategory = 0.9;
      sourceRefs.fraudCategory = [sourceId];
    }

    // 4. UTR Extraction from text if citizen pasted 12 digits
    const utrMatch = text.match(/\b([0-9]{12})\b/);
    if (utrMatch) {
      transactionId = utrMatch[1];
      confidence.transactionId = 0.95;
      sourceRefs.transactionId = [sourceId];
    }

    // 5. Debit Institution Recognition
    if (/sbi|state\s*bank|एसबीआई|स्टेट\s*बैंक/i.test(text)) {
      debitInstitution = "State Bank of India";
      confidence.debitInstitution = 0.9;
      sourceRefs.debitInstitution = [sourceId];
    } else if (/hdfc|एचडीएफसी/i.test(text)) {
      debitInstitution = "HDFC Bank";
      confidence.debitInstitution = 0.9;
      sourceRefs.debitInstitution = [sourceId];
    } else if (/icici|आईसीआईसीआई/i.test(text)) {
      debitInstitution = "ICICI Bank";
      confidence.debitInstitution = 0.9;
      sourceRefs.debitInstitution = [sourceId];
    } else if (/axis|एक्सिस/i.test(text)) {
      debitInstitution = "Axis Bank";
      confidence.debitInstitution = 0.9;
      sourceRefs.debitInstitution = [sourceId];
    }

    // 6. Beneficiary VPA if found
    const vpaMatch = text.match(/[\w.-]+@(?:okhdfcbank|okaxis|oksbi|okicici|ybl|ibl|paytm|upi|axl)/i);
    if (vpaMatch) {
      beneficiaryIdentifier = vpaMatch[0];
      confidence.beneficiaryIdentifier = 0.95;
      sourceRefs.beneficiaryIdentifier = [sourceId];
    }

    confidence.narrative = 0.98;
    sourceRefs.narrative = [sourceId];

    return {
      incidentType: "FINANCIAL_CYBER_FRAUD",
      fraudCategory,
      narrative: text,
      amount,
      currency: "INR",
      channel,
      application,
      transactionId,
      debitInstitution,
      beneficiaryIdentifier,
      confidence,
      sourceRefs,
      extractedAt: new Date().toISOString(),
    };
  }
}
