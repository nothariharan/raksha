/**
 * Raksha Model Context Protocol (MCP) Server
 * Exposes deterministic, safety-guarded public-service tools for autonomous AI agents.
 */

import { CAPActionResponse, ProcessResponse } from "@raksha/schemas";
import { computeSha256 } from "@raksha/shared";
import { RAKSHA_MCP_TOOL_POLICIES, MCPToolPolicy } from "./policy.js";

export interface MCPServerConfig {
  coreBaseUrl?: string;
  capBaseUrl?: string;
}

export class RakshaMCPServer {
  private coreBaseUrl: string;
  private capBaseUrl: string;

  constructor(config?: MCPServerConfig) {
    this.coreBaseUrl = config?.coreBaseUrl || process.env.CORE_BASE_URL || "http://localhost:3001";
    this.capBaseUrl = config?.capBaseUrl || process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
  }

  listTools(): MCPToolPolicy[] {
    return Object.values(RAKSHA_MCP_TOOL_POLICIES);
  }

  async callTool(name: string, args: Record<string, any>): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
    try {
      let result: unknown;

      switch (name) {
        case "raksha_discover_capabilities": {
          result = await this.discoverCapabilities();
          break;
        }

        case "raksha_start_incident": {
          result = await this.startIncident({
            narrative: String(args.narrative || ""),
            reporterPhone: args.reporterPhone as string | undefined,
            language: args.language as string | undefined,
          });
          break;
        }

        case "raksha_process_input": {
          result = await this.processInput({
            incidentId: String(args.incidentId || ""),
            content: String(args.content || ""),
            userClarificationAnswer: args.userClarificationAnswer,
          });
          break;
        }

        case "raksha_add_evidence": {
          result = await this.addEvidence({
            incidentId: String(args.incidentId || ""),
            type: String(args.type || "SCREENSHOT"),
            mediaUrl: String(args.mediaUrl || ""),
            ocrText: args.ocrText as string | undefined,
          });
          break;
        }

        case "raksha_get_status": {
          result = await this.getStatus({
            incidentId: String(args.incidentId || ""),
          });
          break;
        }

        case "raksha_submit_incident": {
          result = await this.submitIncident({
            incidentId: String(args.incidentId || ""),
            confirmedByCitizen: Boolean(args.confirmedByCitizen),
          });
          break;
        }

        case "raksha_get_case_events": {
          result = await this.getCaseEvents({
            caseId: String(args.caseId || ""),
          });
          break;
        }

        default:
          return {
            content: [{ type: "text", text: JSON.stringify({ error: `Unknown MCP tool: ${name}` }) }],
            isError: true,
          };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: (err as Error).message }) }],
        isError: true,
      };
    }
  }

  private async discoverCapabilities() {
    try {
      const res = await fetch(`${this.capBaseUrl}/cap/capabilities`);
      if (!res.ok) {
        return { status: "DEFERRED", reason: "SERVICE_UNAVAILABLE" };
      }
      return await res.json();
    } catch {
      return { status: "DEFERRED", reason: "SERVICE_UNAVAILABLE" };
    }
  }

  private async startIncident(args: { narrative: string; reporterPhone?: string; language?: string }) {
    const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "mcp",
        modality: "text",
        content: args.narrative,
        language: args.language || "en",
        reporter: { mobile: args.reporterPhone || "+919876543210" },
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to start incident: ${res.statusText}`);
    }

    const data = (await res.json()) as ProcessResponse;

    if (data.state === "QUESTION_PENDING") {
      return {
        status: "QUESTION_REQUIRED",
        incidentId: data.incidentId,
        field: data.nextAction.field || "transaction.transactionId",
        question: data.nextAction.prompt || "Please provide the 12-digit UTR or Reference Number.",
        state: data.state,
      };
    }

    return {
      status: "INCIDENT_CREATED",
      incidentId: data.incidentId,
      state: data.state,
      nextAction: data.nextAction,
      incident: data.incident,
    };
  }

  private async processInput(args: {
    incidentId: string;
    content: string;
    userClarificationAnswer?: { field: string; answerValue: unknown };
  }) {
    let answer = args.userClarificationAnswer;
    if (!answer && /^\d{12}$/.test(args.content.trim())) {
      answer = {
        field: "transaction.transactionId",
        answerValue: args.content.trim(),
      };
    }

    const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId: args.incidentId,
        source: "mcp",
        modality: "text",
        content: args.content,
        userClarificationAnswer: answer,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to process input: ${res.statusText}`);
    }

    const data = (await res.json()) as ProcessResponse;

    if (data.state === "USER_CONFIRMATION") {
      return {
        status: "CONFIRMATION_REQUIRED",
        incidentId: data.incidentId,
        conflict: {
          field: data.nextAction.conflictField || "transaction.amount",
          prompt: data.nextAction.prompt,
          options: data.nextAction.options,
        },
        state: data.state,
      };
    }

    if (data.state === "READY") {
      return {
        status: "READY_FOR_CONFIRMATION",
        incidentId: data.incidentId,
        state: data.state,
        transaction: data.incident.transaction,
        readyForSubmission: true,
      };
    }

    return {
      status: "UPDATED",
      incidentId: data.incidentId,
      state: data.state,
      nextAction: data.nextAction,
    };
  }

  private async addEvidence(args: {
    incidentId: string;
    type: string;
    mediaUrl: string;
    ocrText?: string;
  }) {
    const evidencePayload = {
      type: args.type,
      uri: args.mediaUrl,
      ocrText: args.ocrText,
      hash: computeSha256(`${args.mediaUrl}:${args.ocrText || ""}:${Date.now()}`),
      metadata: { addedVia: "mcp" },
    };

    const evRes = await fetch(`${this.coreBaseUrl}/v1/incidents/${args.incidentId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evidencePayload),
    });

    if (!evRes.ok) {
      throw new Error(`Failed to attach evidence: ${evRes.statusText}`);
    }

    const evData = (await evRes.json()) as { evidence?: { id?: string; hash?: string }; incident?: { state?: string } };

    // Re-trigger process engine with OCR content if present
    if (args.ocrText) {
      const procRes = await fetch(`${this.coreBaseUrl}/v1/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: args.incidentId,
          source: "mcp",
          modality: "image",
          content: args.ocrText,
        }),
      });
      if (procRes.ok) {
        const pData = (await procRes.json()) as ProcessResponse;
        return {
          evidenceId: evData.evidence?.id,
          hash: evData.evidence?.hash,
          incidentState: pData.state,
          readyForSubmission: pData.state === "READY",
        };
      }
    }

    return {
      evidenceId: evData.evidence?.id,
      hash: evData.evidence?.hash,
      incidentState: evData.incident?.state || "EXTRACTING",
    };
  }

  private async getStatus(args: { incidentId: string }) {
    const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${args.incidentId}`);
    if (!res.ok) {
      return { error: `Incident ${args.incidentId} not found` };
    }
    return await res.json();
  }

  private async submitIncident(args: { incidentId: string; confirmedByCitizen: boolean }) {
    // Deterministic Safety Check: High-Risk Action MUST have citizen confirmation
    if (args.confirmedByCitizen !== true) {
      return {
        status: "CONFIRMATION_REQUIRED",
        error: "Action 'raksha_submit_incident' is HIGH-RISK and requires explicit confirmedByCitizen=true from the citizen.",
      };
    }

    // Fetch incident to submit
    const incRes = await fetch(`${this.coreBaseUrl}/v1/incidents/${args.incidentId}`);
    if (!incRes.ok) {
      throw new Error(`Incident ${args.incidentId} not found`);
    }
    const incident = await incRes.json();

    const idempotencyKey = `mcp-cap-${args.incidentId}`;
    let capRes: Response;
    try {
      capRes = await fetch(`${this.capBaseUrl}/cap/actions/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          action: "report_financial_fraud",
          payload: incident,
          idempotencyKey,
        }),
      });
    } catch {
      // CAP unavailable failure handling
      return {
        status: "DEFERRED",
        reason: "SERVICE_UNAVAILABLE",
        message: "CAP service is temporarily unreachable. The incident is securely sealed in Core and will be retried.",
      };
    }

    if (!capRes.ok) {
      return {
        status: "DEFERRED",
        reason: "SERVICE_UNAVAILABLE",
        statusCode: capRes.status,
      };
    }

    const capData = (await capRes.json()) as CAPActionResponse;
    const refNum = capData.externalReference || `1930-SYN-${capData.caseId}`;

    return {
      status: "SUBMITTED",
      success: true,
      officialReference: refNum,
      caseId: capData.caseId,
      timestamp: new Date().toISOString(),
    };
  }

  private async getCaseEvents(args: { caseId: string }) {
    const res = await fetch(`${this.capBaseUrl}/cap/cases/${args.caseId}/events`);
    if (!res.ok) {
      return { error: `Case ${args.caseId} events not found` };
    }
    return await res.json();
  }
}

export const defaultMCPServer = new RakshaMCPServer();
