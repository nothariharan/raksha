/**
 * Synthetic development incidents for Portal A.
 * Field names follow packages/schemas (FraudIncident) — never portal-local aliases.
 */

import { FraudIncident, PROTOCOL_VERSION } from "@raksha/schemas";

export const SYNTHETIC_INTAKE_INCIDENT: FraudIncident = {
  id: "RKS-DEMO-001",
  protocolVersion: PROTOCOL_VERSION,
  type: "FINANCIAL_CYBER_FRAUD",
  narrative: {
    text: "Urgent: Paid ₹75,000 to fake cyber police digital arrest account via UPI.",
    source: "web",
  },
  reporter: {
    mobile: "+919888877777",
    name: "Aarav Sharma",
    preferredLanguage: "en",
    state: "Karnataka",
    district: "Bengaluru Urban",
  },
  transaction: {
    amount: 75000,
    currency: "INR",
    transactionId: "423456789012",
    timestamp: "2026-08-24T19:00:00+05:30",
    debitInstitution: "HDFC Bank",
    beneficiaryIdentifier: "mule.account@ybl",
    beneficiaryInstitution: "Yes Bank Ltd",
    channel: "UPI",
  },
  evidence: ["EV-001"],
  state: "READY",
  validation: {
    status: "READY",
    missingFields: [],
    conflicts: [],
    validatedAt: "2026-08-24T19:01:00+05:30",
  },
  handoff: {
    target: "portal-a",
    status: "PENDING",
  },
  createdAt: "2026-08-24T19:00:00+05:30",
  updatedAt: "2026-08-24T19:01:00+05:30",
};

export function buildIncidentFromIntakeForm(input: {
  narrativeText: string;
  amount?: number;
  transactionId?: string;
  timestamp?: string;
  debitInstitution?: string;
  beneficiaryIdentifier?: string;
  beneficiaryInstitution?: string;
  channel?: FraudIncident["transaction"]["channel"];
  reporterName?: string;
  reporterMobile?: string;
  evidence?: string;
}): FraudIncident {
  const now = new Date().toISOString();
  const evidenceIds = input.evidence
    ? input.evidence
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    id: `RKS-PA-${Date.now()}`,
    protocolVersion: PROTOCOL_VERSION,
    type: "FINANCIAL_CYBER_FRAUD",
    narrative: {
      text: input.narrativeText,
      source: "web",
    },
    reporter: {
      name: input.reporterName,
      mobile: input.reporterMobile,
    },
    transaction: {
      amount: input.amount,
      currency: "INR",
      transactionId: input.transactionId,
      timestamp: input.timestamp || now,
      debitInstitution: input.debitInstitution,
      beneficiaryIdentifier: input.beneficiaryIdentifier,
      beneficiaryInstitution: input.beneficiaryInstitution,
      channel: input.channel || "UPI",
    },
    evidence: evidenceIds,
    state: "READY",
    validation: {
      status: "READY",
      missingFields: [],
      conflicts: [],
    },
    handoff: {
      target: "portal-a",
      status: "PENDING",
    },
    createdAt: now,
    updatedAt: now,
  };
}
