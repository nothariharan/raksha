/**
 * Deterministic Incident Validation Engine for Raksha
 * Performs schema, completeness, and cross-source contradiction checks.
 */

import { FraudIncident, IncidentValidation, ValidationStatus } from "@raksha/schemas";
import { getTranslation } from "@raksha/i18n";

export class ValidationEngine {
  static validate(incident: FraudIncident): IncidentValidation {
    const missingFields: string[] = [];
    const conflicts: Array<{ field: string; values: unknown[]; explanation: string }> = [];
    const lang = incident.reporter.preferredLanguage || "en";
    const i18n = getTranslation(lang);

    // 1. Narrative Check
    if (!incident.narrative || !incident.narrative.text || incident.narrative.text.trim().length === 0) {
      missingFields.push("narrative.text");
    }

    // 2. Amount Check
    if (
      incident.transaction.amount === undefined ||
      incident.transaction.amount === null ||
      incident.transaction.amount <= 0 ||
      isNaN(incident.transaction.amount)
    ) {
      missingFields.push("transaction.amount");
    }

    // 3. Transaction ID (UTR / RRN) Check
    if (!incident.transaction.transactionId || incident.transaction.transactionId.trim().length === 0) {
      missingFields.push("transaction.transactionId");
    }

    // 4. Timestamp Check
    if (!incident.transaction.timestamp) {
      missingFields.push("transaction.timestamp");
    }

    // 5. Check Contradictions (e.g., narrative vs transaction amount if narrative has numbers)
    if (incident.narrative?.text && incident.transaction?.amount) {
      const match = incident.narrative.text.match(/(?:rs\.?|inr|₹)\s*([\d,]+)/i);
      if (match && match[1]) {
        const narrativeAmount = parseFloat(match[1].replace(/,/g, ""));
        if (narrativeAmount > 0 && narrativeAmount !== incident.transaction.amount) {
          conflicts.push({
            field: "transaction.amount",
            values: [narrativeAmount, incident.transaction.amount],
            explanation: `Narrative states ₹${narrativeAmount} while transaction record states ₹${incident.transaction.amount}.`,
          });
        }
      }
    }

    // Keep reconciliation conflicts written by ProcessService — validate()
    // only sees the merged incident, not the full candidate history.
    const prior = incident.validation?.conflicts || [];
    for (const pc of prior) {
      if (!conflicts.some((c) => c.field === pc.field)) {
        conflicts.push(pc);
      }
    }

    // Determine status & next clarification question
    let status: ValidationStatus = "READY";
    let nextQuestion: string | undefined;

    if (conflicts.length > 0) {
      status = "CONFLICT";
      nextQuestion = i18n.askConflictResolution;
    } else if (missingFields.length > 0) {
      status = "INCOMPLETE";
      if (missingFields.includes("transaction.transactionId")) {
        nextQuestion = i18n.askMissingUTR;
      } else if (missingFields.includes("transaction.amount")) {
        nextQuestion = i18n.askMissingAmount;
      } else if (missingFields.includes("transaction.timestamp")) {
        nextQuestion = i18n.askMissingDate;
      } else {
        nextQuestion = i18n.askTransactionDetails;
      }
    }

    return {
      status,
      missingFields,
      conflicts,
      nextQuestion,
      validatedAt: new Date().toISOString(),
      // Preserve edge-gate flags — validate() rebuilds status/missing but must not wipe proof flow.
      factsConfirmed: incident.validation?.factsConfirmed,
      proofVerified: incident.validation?.proofVerified,
      contextCaptured: incident.validation?.contextCaptured,
    };
  }
}
