/**
 * Deterministic Cross-Source Reconciliation Engine
 * Combines candidates extracted across Voice, Text, Screenshots, and SMS without LLM guessing.
 */

import { TransactionChannel } from "@raksha/schemas";
import { ExtractedFraudCandidate } from "../extraction/extraction-types.js";

export interface ReconciledConflict {
  field: string;
  values: unknown[];
  sources: string[];
  explanation: string;
}

export interface ReconciliationResult {
  reconciledCandidate: ExtractedFraudCandidate;
  hasConflicts: boolean;
  conflicts: ReconciledConflict[];
  agreements: Array<{ field: string; value: unknown; sourceCount: number }>;
  missingCrucialFields: string[];
}

export class ReconciliationEngine {
  static reconcile(candidates: ExtractedFraudCandidate[]): ReconciliationResult {
    if (candidates.length === 0) {
      throw new Error("Cannot reconcile empty list of candidates");
    }

    if (candidates.length === 1) {
      const single = candidates[0];
      const missingCrucialFields: string[] = [];
      if (!single.amount) missingCrucialFields.push("transaction.amount");
      if (!single.transactionId) missingCrucialFields.push("transaction.transactionId");

      return {
        reconciledCandidate: single,
        hasConflicts: false,
        conflicts: [],
        agreements: [],
        missingCrucialFields,
      };
    }

    const conflicts: ReconciledConflict[] = [];
    const agreements: Array<{ field: string; value: unknown; sourceCount: number }> = [];
    const mergedConfidence: Record<string, number> = {};
    const mergedSourceRefs: Record<string, string[]> = {};

    // 1. Amount Reconciliation
    const amountsWithSources: Array<{ amount: number; source: string }> = [];
    for (const c of candidates) {
      if (c.amount !== undefined && c.amount > 0) {
        const src = c.sourceRefs.amount ? c.sourceRefs.amount[0] : "unknown";
        amountsWithSources.push({ amount: c.amount, source: src });
      }
    }

    let finalAmount: number | undefined;
    if (amountsWithSources.length > 0) {
      const distinctAmounts = Array.from(new Set(amountsWithSources.map((a) => a.amount)));
      if (distinctAmounts.length === 1) {
        finalAmount = distinctAmounts[0];
        mergedConfidence.amount = Math.min(1.0, 0.85 + amountsWithSources.length * 0.07);
        mergedSourceRefs.amount = amountsWithSources.map((a) => a.source);
        if (amountsWithSources.length > 1) {
          agreements.push({ field: "transaction.amount", value: finalAmount, sourceCount: amountsWithSources.length });
        }
      } else {
        // CONFLICT detected between sources!
        finalAmount = distinctAmounts[0]; // fallback pointer
        conflicts.push({
          field: "transaction.amount",
          values: distinctAmounts,
          sources: amountsWithSources.map((a) => `${a.source}: ₹${a.amount}`),
          explanation: `Conflicting amounts found across sources: ${amountsWithSources.map((a) => `${a.source} states ₹${a.amount}`).join(" vs ")}.`,
        });
      }
    }

    // 2. Transaction ID (12-digit UTR)
    let finalUtr: string | null = null;
    for (const c of candidates) {
      if (c.transactionId) {
        finalUtr = c.transactionId;
        mergedConfidence.transactionId = c.confidence.transactionId || 0.95;
        mergedSourceRefs.transactionId = c.sourceRefs.transactionId || [];
        break;
      }
    }

    // 3. Timestamp (defaults to recent extraction time if not explicitly in OCR)
    let finalTimestamp: string | null = null;
    for (const c of candidates) {
      if (c.transactionDatetime) {
        finalTimestamp = c.transactionDatetime;
        mergedConfidence.transactionDatetime = c.confidence.transactionDatetime || 0.9;
        mergedSourceRefs.transactionDatetime = c.sourceRefs.transactionDatetime || [];
        break;
      }
    }
    if (!finalTimestamp) {
      finalTimestamp = new Date().toISOString();
    }

    // 4. Debit Bank & Beneficiary
    let finalDebitBank: string | null = null;
    let finalBeneficiary: string | null = null;
    let finalBeneficiaryBank: string | null = null;
    let finalApplication: string | undefined;
    let finalChannel: TransactionChannel = "UPI";

    for (const c of candidates) {
      if (c.debitInstitution) finalDebitBank = c.debitInstitution;
      if (c.beneficiaryIdentifier) finalBeneficiary = c.beneficiaryIdentifier;
      if (c.beneficiaryInstitution) finalBeneficiaryBank = c.beneficiaryInstitution;
      if (c.application) finalApplication = c.application;
      if (c.channel) finalChannel = c.channel;
    }

    // 5. Narrative Aggregation
    const narratives = candidates.map((c) => c.narrative).filter(Boolean);
    const finalNarrative = narratives.join(" | ");

    // Check missing fields
    const missingCrucialFields: string[] = [];
    if (!finalAmount) missingCrucialFields.push("transaction.amount");
    if (!finalUtr) missingCrucialFields.push("transaction.transactionId");

    const reconciledCandidate: ExtractedFraudCandidate = {
      incidentType: "FINANCIAL_CYBER_FRAUD",
      fraudCategory: candidates[0]?.fraudCategory || "OTHER",
      narrative: finalNarrative,
      amount: finalAmount,
      currency: "INR",
      channel: finalChannel,
      application: finalApplication,
      transactionId: finalUtr,
      transactionDatetime: finalTimestamp,
      debitInstitution: finalDebitBank,
      beneficiaryIdentifier: finalBeneficiary,
      beneficiaryInstitution: finalBeneficiaryBank,
      confidence: mergedConfidence,
      sourceRefs: mergedSourceRefs,
      extractedAt: new Date().toISOString(),
    };

    return {
      reconciledCandidate,
      hasConflicts: conflicts.length > 0,
      conflicts,
      agreements,
      missingCrucialFields,
    };
  }
}
