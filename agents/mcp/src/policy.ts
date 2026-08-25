/**
 * Deterministic Tool Policy for Raksha Model Context Protocol (MCP) Server
 * Declares safety boundaries, required schemas, risk levels, and human confirmation enforcement.
 */

export interface MCPToolPolicy {
  name: string;
  description: string;
  purpose: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  requiresConfirmation: boolean;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  outputSchema: {
    type: "object";
    properties: Record<string, unknown>;
  };
}

export const RAKSHA_MCP_TOOL_POLICIES: Record<string, MCPToolPolicy> = {
  raksha_discover_capabilities: {
    name: "raksha_discover_capabilities",
    description: "Discover authorized machine-readable civic actions and public service manifests via CAP.",
    purpose: "Allows AI agents to discover what government actions are callable without web scraping.",
    risk: "LOW",
    requiresConfirmation: false,
    inputSchema: {
      type: "object",
      properties: {},
    },
    outputSchema: {
      type: "object",
      properties: {
        protocol: { type: "string" },
        manifest: { type: "object" },
        capabilities: { type: "array" },
      },
    },
  },

  raksha_start_incident: {
    name: "raksha_start_incident",
    description: "Create a canonical fraud reporting incident from natural language distress narrative.",
    purpose: "Initializes a deterministic incident container and begins multi-source extraction.",
    risk: "LOW",
    requiresConfirmation: false,
    inputSchema: {
      type: "object",
      properties: {
        narrative: { type: "string", description: "Victim's natural language account of the scam" },
        reporterPhone: { type: "string", description: "Citizen mobile number (+91XXXXXXXXXX)" },
        language: { type: "string", description: "Preferred language (e.g., en, hi, ta)" },
      },
      required: ["narrative"],
    },
    outputSchema: {
      type: "object",
      properties: {
        incidentId: { type: "string" },
        state: { type: "string" },
        nextAction: { type: "object" },
      },
    },
  },

  raksha_process_input: {
    name: "raksha_process_input",
    description: "Submit clarifying data, answers, or corrections to an existing incident container.",
    purpose: "Advances the incident state machine through missing field questions or contradiction fixes.",
    risk: "LOW",
    requiresConfirmation: false,
    inputSchema: {
      type: "object",
      properties: {
        incidentId: { type: "string", description: "Active canonical incident ID" },
        content: { type: "string", description: "User's clarification text or input" },
        userClarificationAnswer: {
          type: "object",
          properties: {
            field: { type: "string" },
            answerValue: {},
          },
        },
      },
      required: ["incidentId", "content"],
    },
    outputSchema: {
      type: "object",
      properties: {
        incidentId: { type: "string" },
        state: { type: "string" },
        nextAction: { type: "object" },
      },
    },
  },

  raksha_add_evidence: {
    name: "raksha_add_evidence",
    description: "Attach cryptographic evidence (OCR payment screenshot, voice note transcript, PDF) to incident.",
    purpose: "Seals multi-source artifacts into the tamper-evident incident capsule.",
    risk: "MEDIUM",
    requiresConfirmation: false,
    inputSchema: {
      type: "object",
      properties: {
        incidentId: { type: "string", description: "Canonical incident ID" },
        type: { type: "string", enum: ["SCREENSHOT", "VOICE_NOTE", "SMS", "BANK_STATEMENT"] },
        mediaUrl: { type: "string", description: "Storage URI of evidence artifact" },
        ocrText: { type: "string", description: "Extracted OCR text if applicable" },
      },
      required: ["incidentId", "type", "mediaUrl"],
    },
    outputSchema: {
      type: "object",
      properties: {
        evidenceId: { type: "string" },
        hash: { type: "string" },
        incidentState: { type: "string" },
      },
    },
  },

  raksha_get_status: {
    name: "raksha_get_status",
    description: "Get canonical incident details, verified transaction summary, and timeline audit trail.",
    purpose: "Read-only inspection of incident progress and bank response state.",
    risk: "LOW",
    requiresConfirmation: false,
    inputSchema: {
      type: "object",
      properties: {
        incidentId: { type: "string", description: "Canonical incident ID" },
      },
      required: ["incidentId"],
    },
    outputSchema: {
      type: "object",
      properties: {
        incident: { type: "object" },
      },
    },
  },

  raksha_submit_incident: {
    name: "raksha_submit_incident",
    description: "Execute official emergency fraud reporting and freeze action via Civic Action Protocol (CAP).",
    purpose: "Submits incident to Portal A (1930 Cyber Cell) and dispatches downstream banking freeze.",
    risk: "HIGH",
    requiresConfirmation: true,
    inputSchema: {
      type: "object",
      properties: {
        incidentId: { type: "string", description: "Canonical incident ID to submit" },
        confirmedByCitizen: {
          type: "boolean",
          description: "MUST be true. Explicit confirmation from citizen authorizing submission.",
        },
      },
      required: ["incidentId", "confirmedByCitizen"],
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        officialReference: { type: "string" },
        caseId: { type: "string" },
      },
    },
  },

  raksha_get_case_events: {
    name: "raksha_get_case_events",
    description: "Retrieve immutable CAP audit ledger events for a case.",
    purpose: "Enables external verifiers and agents to inspect cross-entity event history.",
    risk: "LOW",
    requiresConfirmation: false,
    inputSchema: {
      type: "object",
      properties: {
        caseId: { type: "string", description: "CAP Case ID" },
      },
      required: ["caseId"],
    },
    outputSchema: {
      type: "object",
      properties: {
        caseId: { type: "string" },
        events: { type: "array" },
      },
    },
  },
};
