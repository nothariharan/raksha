/**
 * One-Question Clarification Engine for Raksha Core
 * Asks adaptive context first, then money fields required for 1930 freeze.
 */

import { getTranslation, SupportedLanguage } from "@raksha/i18n";
import { FraudCategory } from "@raksha/schemas";
import { ReconciliationResult } from "../reconciliation/reconciler.js";

export type NextActionType =
  | "NONE"
  | "ASK_USER"
  | "CONFIRM_CONFLICT"
  | "ASK_PROOF"
  | "READY_FOR_HANDOFF";

export interface ClarificationDecision {
  type: NextActionType;
  nextActionType: NextActionType;
  field?: string;
  missingField?: string;
  conflictField?: string;
  prompt: string;
  localizedPrompts: Record<SupportedLanguage, string>;
  options?: Array<{ label: string; value: unknown }>;
  isComplete: boolean;
}

export interface ClarificationContext {
  fraudCategory?: FraudCategory;
  narrativeText?: string;
  contextCaptured?: boolean;
  factsConfirmed?: boolean;
  proofVerified?: boolean;
  hasScreenshotEvidence?: boolean;
}

function contextPrompt(category: FraudCategory | undefined, lang: SupportedLanguage): {
  field: string;
  prompt: string;
  localizedPrompts: Record<SupportedLanguage, string>;
} {
  const enByCat: Record<string, string> = {
    DIGITAL_ARREST:
      "Who contacted you, and what agency or authority did they claim to be from?",
    TASK_SCAM: "What were you promised in return for the payment or tasks you completed?",
    ELECTRICITY_BILL_SCAM: "How did they contact you about the electricity or utility bill?",
    KYC_UPDATE_FRAUD: "Which app or website asked you to update KYC, and what did they ask you to do?",
    CUSTOMER_CARE_IMPERSONATION:
      "Which company or bank did they claim to represent, and how did they reach you?",
    LOTTERY_PHISHING: "What prize or refund were you told you had won?",
    UPI_PAYMENT_FRAUD: "How did the fraudulent UPI payment start — who messaged or called you first?",
    OTHER: "In a few sentences, what kind of scam was this and how did it start?",
  };
  const hiByCat: Record<string, string> = {
    DIGITAL_ARREST: "आपसे किसने संपर्क किया, और उन्होंने किस एजेंसी का नाम लिया?",
    TASK_SCAM: "भुगतान या टास्क के बदले आपको क्या वादा किया गया था?",
    ELECTRICITY_BILL_SCAM: "बिजली/यूटिलिटी बिल के बारे में उन्होंने आपसे कैसे संपर्क किया?",
    KYC_UPDATE_FRAUD: "KYC अपडेट किस ऐप/वेबसाइट ने माँगा, और क्या करने को कहा?",
    CUSTOMER_CARE_IMPERSONATION: "उन्होंने किस कंपनी/बैंक का नाम लिया, और कैसे संपर्क किया?",
    LOTTERY_PHISHING: "आपको कौन सा इनाम या रिफंड मिलने की बात कही गई?",
    UPI_PAYMENT_FRAUD: "धोखाधड़ी वाला UPI भुगतान कैसे शुरू हुआ — पहले किसने मैसेज/कॉल किया?",
    OTHER: "कृपया बताएं यह किस प्रकार की ठगी थी और कैसे शुरू हुई?",
  };
  const key = category && enByCat[category] ? category : "OTHER";
  const promptEn = enByCat[key];
  const promptHi = hiByCat[key];
  return {
    field: "scam.context",
    prompt: lang === "hi" ? promptHi : promptEn,
    localizedPrompts: {
      en: promptEn,
      hi: promptHi,
      ta: "இந்த மோசடி எவ்வாறு தொடங்கியது என்பதை சுருக்கமாகச் சொல்லுங்கள்.",
      te: "ఈ మోసం ఎలా మొదలైందో కొద్ది మాటల్లో చెప్పండి.",
      kn: "ಈ ವಂಚನೆ ಹೇಗೆ ಪ್ರಾರಂಭವಾಯಿತು ಎಂದು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಹೇಳಿ.",
      bn: "এই প্রতারণা কীভাবে শুরু হয়েছিল সংক্ষেপে বলুন।",
      mr: "ही फसवणूक कशी सुरू झाली ते थोडक्यात सांगा.",
    },
  };
}

function narrativeNeedsContext(narrativeText: string | undefined, category?: FraudCategory): boolean {
  const text = (narrativeText || "").trim();
  if (text.length < 48) return true;
  if (!category || category === "OTHER") return text.length < 120;
  return false;
}

export class ClarificationEngine {
  static decideNextQuestion(
    result: ReconciliationResult,
    preferredLanguage: string = "en",
    ctx: ClarificationContext = {}
  ): ClarificationDecision {
    const lang = (preferredLanguage.toLowerCase().slice(0, 2) as SupportedLanguage) || "en";
    const i18n = getTranslation(lang);

    // 1. Conflict Resolution (Highest Priority)
    if (result.hasConflicts && result.conflicts.length > 0) {
      const conflict = result.conflicts[0];
      const promptEn = `I noticed a difference in the ${conflict.field.replace("transaction.", "")}: ${conflict.sources.join(" vs ")}. Which value is correct?`;
      const promptHi = `लेन-देन विवरण में अंतर पाया गया: ${conflict.sources.join(" बनाम ")}। कृपया सही विवरण की पुष्टि करें।`;

      const options = (conflict.values || []).map((value) => ({
        label: typeof value === "number" ? `₹${Number(value).toLocaleString("en-IN")}` : String(value),
        value,
      }));

      return {
        type: "CONFIRM_CONFLICT",
        nextActionType: "CONFIRM_CONFLICT",
        field: conflict.field,
        conflictField: conflict.field,
        prompt: lang === "hi" ? promptHi : promptEn,
        localizedPrompts: {
          en: promptEn,
          hi: promptHi,
          ta: `பரிவர்த்தனை விவரத்தில் முரண்பாடு உள்ளது. சரியான விவரத்தை உறுதிப்படுத்தவும்.`,
          te: `లావాదేవీ వివరాలలో తేడా ఉంది. సరైన మొత్తాన్ని నిర్ధారించండి.`,
          kn: `ವಹಿವಾಟಿನ ವಿವರದಲ್ಲಿ ವ್ಯತ್ಯಾಸವಿದೆ. ಸರಿಯಾದ ವಿವರವನ್ನು ದೃಢೀಕರಿಸಿ.`,
          bn: `লেনদেনের পরিমাণে গরমিল আছে। সঠিক পরিমাণ নিশ্চিত করুন।`,
          mr: `व्यवहाराच्या तपशीलात तफावत आहे. कृपया योग्य तपशील निश्चित करा.`,
        },
        options,
        isComplete: false,
      };
    }

    // 2. Adaptive scam-context question before money checklist
    const category = ctx.fraudCategory || result.reconciledCandidate.fraudCategory;
    if (
      !ctx.contextCaptured &&
      narrativeNeedsContext(ctx.narrativeText || result.reconciledCandidate.narrative, category)
    ) {
      const q = contextPrompt(category, lang);
      return {
        type: "ASK_USER",
        nextActionType: "ASK_USER",
        field: q.field,
        missingField: q.field,
        prompt: q.prompt,
        localizedPrompts: q.localizedPrompts,
        isComplete: false,
      };
    }

    // 3. Missing UTR (Critical for Golden Hour 1930 / Bank Lien) when payment exists or amount known
    const hasAmount = !!result.reconciledCandidate.amount;
    if (
      hasAmount &&
      result.missingCrucialFields.includes("transaction.transactionId")
    ) {
      return {
        type: "ASK_USER",
        nextActionType: "ASK_USER",
        field: "transaction.transactionId",
        missingField: "transaction.transactionId",
        prompt: i18n.askMissingUTR,
        localizedPrompts: {
          en: getTranslation("en").askMissingUTR,
          hi: getTranslation("hi").askMissingUTR,
          ta: getTranslation("ta").askMissingUTR,
          te: getTranslation("te").askMissingUTR,
          kn: getTranslation("kn").askMissingUTR,
          bn: getTranslation("bn").askMissingUTR,
          mr: getTranslation("mr").askMissingUTR,
        },
        isComplete: false,
      };
    }

    // 4. Missing Amount (payment-related freeze path)
    if (result.missingCrucialFields.includes("transaction.amount")) {
      return {
        type: "ASK_USER",
        nextActionType: "ASK_USER",
        field: "transaction.amount",
        missingField: "transaction.amount",
        prompt: i18n.askMissingAmount,
        localizedPrompts: {
          en: getTranslation("en").askMissingAmount,
          hi: getTranslation("hi").askMissingAmount,
          ta: getTranslation("ta").askMissingAmount,
          te: getTranslation("te").askMissingAmount,
          kn: getTranslation("kn").askMissingAmount,
          bn: getTranslation("bn").askMissingAmount,
          mr: getTranslation("mr").askMissingAmount,
        },
        isComplete: false,
      };
    }

    // 5. Missing bank when amount known
    if (hasAmount && !result.reconciledCandidate.debitInstitution) {
      const promptEn = "Which bank account was debited for this payment (for example SBI, HDFC, ICICI)?";
      const promptHi = "यह भुगतान किस बैंक खाते से कटा (जैसे SBI, HDFC, ICICI)?";
      return {
        type: "ASK_USER",
        nextActionType: "ASK_USER",
        field: "transaction.debitInstitution",
        missingField: "transaction.debitInstitution",
        prompt: lang === "hi" ? promptHi : promptEn,
        localizedPrompts: {
          en: promptEn,
          hi: promptHi,
          ta: "இந்த பணம் எந்த வங்கியில் இருந்து பிடிக்கப்பட்டது?",
          te: "ఈ చెల్లింపు ఏ బ్యాంకు నుంచి కట్టబడింది?",
          kn: "ಈ ಪಾವತಿ ಯಾವ ಬ್ಯಾಂಕ್‌ನಿಂದ ಕಡಿತವಾಯಿತು?",
          bn: "এই পেমেন্ট কোন ব্যাংক থেকে কেটেছে?",
          mr: "हे पेमेंट कोणत्या बँकेतून कापले?",
        },
        isComplete: false,
      };
    }

    // 6. Citizen must confirm dossier before proof / CAP
    if (!ctx.factsConfirmed) {
      return {
        type: "READY_FOR_HANDOFF",
        nextActionType: "READY_FOR_HANDOFF",
        prompt: i18n.reportReady,
        localizedPrompts: {
          en: getTranslation("en").reportReady,
          hi: getTranslation("hi").reportReady,
          ta: getTranslation("ta").reportReady,
          te: getTranslation("te").reportReady,
          kn: getTranslation("kn").reportReady,
          bn: getTranslation("bn").reportReady,
          mr: getTranslation("mr").reportReady,
        },
        isComplete: true,
      };
    }

    // 7. After confirm: require a verified payment/SMS screenshot before filing
    if (!ctx.proofVerified) {
      const promptEn =
        "Please upload a payment screenshot (UPI receipt, netbanking confirmation, or bank SMS) so we can verify the transaction before filing.";
      const promptHi =
        "कृपया भुगतान का स्क्रीनशॉट अपलोड करें (UPI रसीद, नेटबैंकिंग, या बैंक SMS) ताकि हम रिपोर्ट दर्ज करने से पहले लेन-देन सत्यापित कर सकें।";
      return {
        type: "ASK_PROOF",
        nextActionType: "ASK_PROOF",
        field: "evidence.screenshot",
        missingField: "evidence.screenshot",
        prompt: lang === "hi" ? promptHi : promptEn,
        localizedPrompts: {
          en: promptEn,
          hi: promptHi,
          ta: "பரிவர்த்தனையை உறுதிப்படுத்த கட்டண ஸ்கிரீன்ஷாட்டைப் பதிவேற்றவும்.",
          te: "ధృవీకరణ కోసం పేమెంట్ స్క్రీన్‌షాట్ అప్‌లోడ్ చేయండి.",
          kn: "ಪರಿಶೀಲನೆಗಾಗಿ ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
          bn: "যাচাইয়ের জন্য পেমেন্ট স্ক্রিনশট আপলোড করুন।",
          mr: " पडताळणीसाठी पेमेंट स्क्रीनशॉट अपलोड करा.",
        },
        isComplete: false,
      };
    }

    // 8. Facts + proof verified → ready for CAP handoff
    return {
      type: "READY_FOR_HANDOFF",
      nextActionType: "READY_FOR_HANDOFF",
      prompt: i18n.reportReady,
      localizedPrompts: {
        en: getTranslation("en").reportReady,
        hi: getTranslation("hi").reportReady,
        ta: getTranslation("ta").reportReady,
        te: getTranslation("te").reportReady,
        kn: getTranslation("kn").reportReady,
        bn: getTranslation("bn").reportReady,
        mr: getTranslation("mr").reportReady,
      },
      isComplete: true,
    };
  }
}
