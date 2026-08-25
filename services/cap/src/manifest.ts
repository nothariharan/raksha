/**
 * Government & Public Service Action Manifest for CAP
 * Machine-readable protocol manifest detailing available public services, schema requirements, and safety policies.
 */

export interface PublicServiceActionManifest {
  name: string;
  description: string;
  requires: string[];
  risk: "LOW" | "MEDIUM" | "HIGH";
  requiresConfirmation: boolean;
  idempotent: boolean;
}

export interface PublicServiceManifest {
  id: string;
  name: string;
  targetPortal: "portal-a" | "portal-b";
  status: "OPERATIONAL" | "DEGRADED" | "SIMULATED";
  actions: PublicServiceActionManifest[];
}

export interface CivicActionManifest {
  protocol: string;
  version: string;
  name: string;
  description: string;
  services: PublicServiceManifest[];
}

export const CAP_GOVERNMENT_MANIFEST: CivicActionManifest = {
  protocol: "cap/0.1",
  version: "0.1.0",
  name: "Civic Action Protocol (CAP)",
  description: "Deterministic machine-readable protocol for AI agents to invoke authorized public-service actions without brittle web-scraping.",
  services: [
    {
      id: "cybercrime.intake",
      name: "Citizen Financial Cyber Fraud Reporting (1930 / Portal A)",
      targetPortal: "portal-a",
      status: "OPERATIONAL",
      actions: [
        {
          name: "report_financial_fraud",
          description: "File emergency financial fraud freeze and evidence packet to 1930 Cyber Cell & Bank Nodal Desk",
          requires: [
            "transaction.amount",
            "transaction.transactionId",
            "transaction.timestamp",
            "transaction.debitInstitution",
            "narrative.text",
          ],
          risk: "HIGH",
          requiresConfirmation: true,
          idempotent: true,
        },
        {
          name: "get_case_status",
          description: "Check real-time processing and bank acknowledgment status for an existing case reference",
          requires: ["caseId"],
          risk: "LOW",
          requiresConfirmation: false,
          idempotent: true,
        },
      ],
    },
    {
      id: "financial.response",
      name: "Intermediary Banking Freeze Response (Portal B)",
      targetPortal: "portal-b",
      status: "OPERATIONAL",
      actions: [
        {
          name: "acknowledge_response",
          description: "Record bank nodal freeze action (e.g., LIEN_MARKED or ACCOUNT_FROZEN)",
          requires: ["caseId", "incidentId", "responderInstitution", "actionTaken"],
          risk: "HIGH",
          requiresConfirmation: true,
          idempotent: true,
        },
      ],
    },
  ],
};
