/**
 * One-Question Clarification Engine for Raksha Core
 * Determines the single highest-priority question to ask a panicked victim.
 */

import { getTranslation, SupportedLanguage } from "@raksha/i18n";
import { ReconciliationResult } from "../reconciliation/reconciler.js";

export type NextActionType = "NONE" | "ASK_USER" | "CONFIRM_CONFLICT" | "READY_FOR_HANDOFF";

export interface ClarificationDecision {
  nextActionType: NextActionType;
  missingField?: string;
  conflictField?: string;
  prompt: string;
  localizedPrompts: Record<SupportedLanguage, string>;
  isComplete: boolean;
}

export class ClarificationEngine {
  static decideNextQuestion(
    result: ReconciliationResult,
    preferredLanguage: string = "en"
  ): ClarificationDecision {
    const lang = (preferredLanguage.toLowerCase().slice(0, 2) as SupportedLanguage) || "en";
    const i18n = getTranslation(lang);

    // 1. Conflict Resolution (Highest Priority)
    if (result.hasConflicts && result.conflicts.length > 0) {
      const conflict = result.conflicts[0];
      const promptEn = `I noticed a difference in the ${conflict.field.replace("transaction.", "")}: ${conflict.sources.join(" vs ")}. Which value is correct?`;
      const promptHi = `लेन-देन विवरण में अंतर पाया गया: ${conflict.sources.join(" बनाम ")}। कृपया सही विवरण की पुष्टि करें।`;

      return {
        nextActionType: "CONFIRM_CONFLICT",
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
        isComplete: false,
      };
    }

    // 2. Missing UTR (Critical for Golden Hour 1930 / Bank Lien)
    if (result.missingCrucialFields.includes("transaction.transactionId")) {
      return {
        nextActionType: "ASK_USER",
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

    // 3. Missing Amount
    if (result.missingCrucialFields.includes("transaction.amount")) {
      return {
        nextActionType: "ASK_USER",
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

    // 4. Missing Timestamp
    if (result.missingCrucialFields.includes("transaction.timestamp")) {
      return {
        nextActionType: "ASK_USER",
        missingField: "transaction.timestamp",
        prompt: i18n.askMissingDate,
        localizedPrompts: {
          en: getTranslation("en").askMissingDate,
          hi: getTranslation("hi").askMissingDate,
          ta: getTranslation("ta").askMissingDate,
          te: getTranslation("te").askMissingDate,
          kn: getTranslation("kn").askMissingDate,
          bn: getTranslation("bn").askMissingDate,
          mr: getTranslation("mr").askMissingDate,
        },
        isComplete: false,
      };
    }

    // 5. Complete & Ready for Official Submission
    return {
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
