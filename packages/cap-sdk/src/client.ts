/**
 * CAP Client SDK
 * Provides a clean interface for Portal A, Portal B, Core, and MCP Agents.
 */

import {
  CAPActionName,
  CAPActionRequest,
  CAPActionResponse,
  CAPCapability,
  CAPCase,
  CAPEvent,
  FraudIncident,
  AcknowledgeResponsePayload,
} from "@raksha/schemas";
import {
  generateCaseId,
  generateExternalReference,
  globalEventBus,
} from "@raksha/shared";

export interface CAPClientConfig {
  baseUrl?: string;
  apiKey?: string;
  mode?: "http" | "mock" | "in-memory";
}

export interface ICAPClient {
  getCapabilities(): Promise<CAPCapability[]>;
  createCase(incident: FraudIncident, idempotencyKey?: string): Promise<CAPActionResponse>;
  validateAction(
    action: CAPActionName,
    payload: unknown
  ): Promise<{ valid: boolean; errors: string[] }>;
  executeAction<T = unknown, R = unknown>(
    action: CAPActionName,
    payload: T,
    idempotencyKey?: string
  ): Promise<CAPActionResponse<R>>;
  getCase(caseId: string): Promise<CAPCase | null>;
  getCaseEvents(caseId: string): Promise<CAPEvent[]>;
  emitEvent(event: {
    type: string;
    caseId: string;
    incidentId?: string;
    source: string;
    payload: unknown;
  }): Promise<CAPEvent>;
}

/**
 * Standard capabilities exposed by CAP v0.1
 */
export const DEFAULT_CAPABILITIES: CAPCapability[] = [
  {
    name: "report_financial_fraud",
    description: "Submit a validated financial cyber fraud incident to intake portal (Portal A / 1930)",
    version: "0.1.0",
    requiredFields: ["incident.transaction.amount", "incident.narrative.text"],
    targetPortal: "portal-a",
  },
  {
    name: "attach_evidence",
    description: "Attach evidence references and hashes to an existing case",
    version: "0.1.0",
    requiredFields: ["caseId", "evidenceId", "sha256"],
    targetPortal: "core",
  },
  {
    name: "acknowledge_response",
    description: "Financial institution acknowledges and records lien or transaction trace (Portal B)",
    version: "0.1.0",
    requiredFields: ["caseId", "responderInstitution", "actionTaken"],
    targetPortal: "portal-b",
  },
  {
    name: "follow_up_case",
    description: "Citizen-authorized follow-up on an already filed case (no institutional judgment)",
    version: "0.1.0",
    requiredFields: ["incidentId", "authorizedByCitizen"],
    targetPortal: "portal-a",
  },
  {
    name: "get_case",
    description: "Retrieve case details and lifecycle status",
    version: "0.1.0",
    requiredFields: ["caseId"],
    targetPortal: "core",
  },
  {
    name: "get_case_events",
    description: "Retrieve chronological audit event log for a case",
    version: "0.1.0",
    requiredFields: ["caseId"],
    targetPortal: "core",
  },
];

/**
 * In-memory / Mock implementation of CAP Client
 */
export class InMemoryCAPClient implements ICAPClient {
  private cases: Map<string, CAPCase> = new Map();
  private idempotencyStore: Map<string, CAPActionResponse> = new Map();

  async getCapabilities(): Promise<CAPCapability[]> {
    return DEFAULT_CAPABILITIES;
  }

  async createCase(incident: FraudIncident, idempotencyKey?: string): Promise<CAPActionResponse> {
    if (idempotencyKey && this.idempotencyStore.has(idempotencyKey)) {
      return this.idempotencyStore.get(idempotencyKey)!;
    }

    const caseId = generateCaseId();
    const externalRef = generateExternalReference("1930");

    const capCase: CAPCase = {
      id: caseId,
      incidentId: incident.id,
      status: "ACCEPTED",
      externalReference: externalRef,
      targetService: "portal-a",
      action: "report_financial_fraud",
      payload: incident,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cases.set(caseId, capCase);

    await globalEventBus.emit({
      type: "incident.accepted",
      caseId,
      incidentId: incident.id,
      source: "cap",
      payload: {
        caseId,
        incidentId: incident.id,
        externalReference: externalRef,
        targetPortal: "portal-a",
        status: "ACCEPTED",
      },
    });

    const res: CAPActionResponse = {
      success: true,
      status: "ACCEPTED",
      caseId,
      externalReference: externalRef,
      data: { caseId, status: "ACCEPTED", externalReference: externalRef },
      timestamp: new Date().toISOString(),
    };

    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, res);
    }

    return res;
  }

  async validateAction(
    action: CAPActionName,
    payload: unknown
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!action) {
      errors.push("Action name is required");
      return { valid: false, errors };
    }

    if (action === "report_financial_fraud") {
      const p = payload as { incident?: FraudIncident };
      if (!p || !p.incident) {
        errors.push("Payload must contain an incident object");
      } else {
        if (!p.incident.transaction?.amount && !p.incident.narrative?.text) {
          errors.push("Incident must have either transaction amount or narrative text");
        }
      }
    } else if (action === "acknowledge_response") {
      const p = payload as Partial<AcknowledgeResponsePayload>;
      if (!p?.caseId) errors.push("Missing caseId");
      if (!p?.responderInstitution) errors.push("Missing responderInstitution");
    }

    return { valid: errors.length === 0, errors };
  }

  async executeAction<T = unknown, R = unknown>(
    action: CAPActionName,
    payload: T,
    idempotencyKey?: string
  ): Promise<CAPActionResponse<R>> {
    if (idempotencyKey && this.idempotencyStore.has(idempotencyKey)) {
      return this.idempotencyStore.get(idempotencyKey)! as unknown as CAPActionResponse<R>;
    }

    const validation = await this.validateAction(action, payload);
    if (!validation.valid) {
      return {
        success: false,
        status: "REJECTED",
        caseId: "",
        error: validation.errors.join("; "),
        timestamp: new Date().toISOString(),
      };
    }

    if (action === "report_financial_fraud") {
      const incident = (payload as { incident: FraudIncident }).incident || (payload as FraudIncident);
      return this.createCase(incident, idempotencyKey) as unknown as Promise<CAPActionResponse<R>>;
    }

    if (action === "acknowledge_response") {
      const ack = payload as AcknowledgeResponsePayload;
      const existing = this.cases.get(ack.caseId);
      if (!existing) {
        return {
          success: false,
          status: "REJECTED",
          caseId: ack.caseId,
          error: `Case not found: ${ack.caseId}`,
          timestamp: new Date().toISOString(),
        };
      }

      existing.status = "ACTION_TAKEN";
      existing.updatedAt = new Date().toISOString();
      this.cases.set(ack.caseId, existing);

      await globalEventBus.emit({
        type: "response.acknowledged",
        caseId: ack.caseId,
        incidentId: ack.incidentId || existing.incidentId,
        source: "portal-b",
        payload: ack,
      });

      const res: CAPActionResponse<R> = {
        success: true,
        status: "ACTION_TAKEN",
        caseId: ack.caseId,
        externalReference: existing.externalReference,
        data: { caseId: ack.caseId, status: "ACTION_TAKEN" } as unknown as R,
        timestamp: new Date().toISOString(),
      };

      if (idempotencyKey) {
        this.idempotencyStore.set(idempotencyKey, res as unknown as CAPActionResponse);
      }

      return res;
    }

    return {
      success: true,
      status: "ACCEPTED",
      caseId: generateCaseId(),
      timestamp: new Date().toISOString(),
    };
  }

  async getCase(caseId: string): Promise<CAPCase | null> {
    return this.cases.get(caseId) || null;
  }

  async getCaseEvents(caseId: string): Promise<CAPEvent[]> {
    return globalEventBus.getEvents({ caseId });
  }

  async emitEvent(event: {
    type: string;
    caseId: string;
    incidentId?: string;
    source: string;
    payload: unknown;
  }): Promise<CAPEvent> {
    return globalEventBus.emit(event);
  }
}

/**
 * HTTP Client implementation of CAP Client (communicates with CAP service via REST)
 */
export class HttpCAPClient implements ICAPClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: CAPClientConfig) {
    this.baseUrl = config.baseUrl || "http://localhost:3002";
    this.apiKey = config.apiKey;
  }

  private async fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`CAP HTTP Error ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async getCapabilities(): Promise<CAPCapability[]> {
    const data = await this.fetchJson<{ capabilities: CAPCapability[] }>("/cap/capabilities");
    return data.capabilities;
  }

  async createCase(incident: FraudIncident, idempotencyKey?: string): Promise<CAPActionResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.fetchJson<CAPActionResponse>("/cap/cases", {
      method: "POST",
      headers,
      body: JSON.stringify({ incident, idempotencyKey }),
    });
  }

  async validateAction(
    action: CAPActionName,
    payload: unknown
  ): Promise<{ valid: boolean; errors: string[] }> {
    return this.fetchJson<{ valid: boolean; errors: string[] }>("/cap/actions/validate", {
      method: "POST",
      body: JSON.stringify({ action, payload }),
    });
  }

  async executeAction<T = unknown, R = unknown>(
    action: CAPActionName,
    payload: T,
    idempotencyKey?: string
  ): Promise<CAPActionResponse<R>> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.fetchJson<CAPActionResponse<R>>("/cap/actions/execute", {
      method: "POST",
      headers,
      body: JSON.stringify({ action, payload, idempotencyKey }),
    });
  }

  async getCase(caseId: string): Promise<CAPCase | null> {
    try {
      const data = await this.fetchJson<{ case: CAPCase }>(`/cap/cases/${caseId}`);
      return data.case;
    } catch {
      return null;
    }
  }

  async getCaseEvents(caseId: string): Promise<CAPEvent[]> {
    const data = await this.fetchJson<{ events: CAPEvent[] }>(`/cap/cases/${caseId}/events`);
    return data.events;
  }

  async emitEvent(event: {
    type: string;
    caseId: string;
    incidentId?: string;
    source: string;
    payload: unknown;
  }): Promise<CAPEvent> {
    return this.fetchJson<CAPEvent>("/cap/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }
}

/**
 * Factory function to create CAP Client
 */
export function createCAPClient(config?: CAPClientConfig): ICAPClient {
  if (config?.mode === "http") {
    return new HttpCAPClient(config);
  }
  return new InMemoryCAPClient();
}
