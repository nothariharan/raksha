import {
  CAPActionName,
  CAPActionResponse,
  CAPCase,
  FraudIncident,
  AcknowledgeResponsePayload,
} from "@raksha/schemas";
import {
  generateCaseId,
  generateExternalReference,
  globalEventBus,
} from "@raksha/shared";
import { capabilityRegistry } from "./capability-registry.js";

export class ActionRouter {
  private cases: Map<string, CAPCase> = new Map();

  async validateAction(
    action: CAPActionName,
    payload: unknown
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const capability = capabilityRegistry.get(action);

    if (!capability) {
      errors.push(`Unknown capability/action: ${action}`);
      return { valid: false, errors };
    }

    if (action === "report_financial_fraud") {
      const p = payload as { incident?: FraudIncident } | FraudIncident;
      const incident = "incident" in p && p.incident ? p.incident : (p as FraudIncident);
      if (!incident || !incident.id) {
        errors.push("Missing valid incident object with ID");
      }
      if (!incident?.narrative?.text && !incident?.transaction?.amount) {
        errors.push("Incident must provide either a narrative or transaction amount");
      }
    } else if (action === "acknowledge_response") {
      const p = payload as Partial<AcknowledgeResponsePayload>;
      if (!p?.caseId) errors.push("Missing caseId");
      if (!p?.responderInstitution) errors.push("Missing responderInstitution");
      if (!p?.actionTaken) errors.push("Missing actionTaken");
    }

    return { valid: errors.length === 0, errors };
  }

  async executeAction<T = unknown, R = unknown>(
    action: CAPActionName,
    payload: T,
    idempotencyKey?: string
  ): Promise<CAPActionResponse<R>> {
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
      const p = payload as { incident?: FraudIncident } | FraudIncident;
      const incident = "incident" in p && p.incident ? p.incident : (p as FraudIncident);

      const caseId = generateCaseId("CAP");
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

      return {
        success: true,
        status: "ACCEPTED",
        caseId,
        externalReference: externalRef,
        data: { caseId, status: "ACCEPTED", externalReference: externalRef } as unknown as R,
        timestamp: new Date().toISOString(),
      };
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

      return {
        success: true,
        status: "ACTION_TAKEN",
        caseId: ack.caseId,
        externalReference: existing.externalReference,
        data: { caseId: ack.caseId, status: "ACTION_TAKEN" } as unknown as R,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      status: "ACCEPTED",
      caseId: generateCaseId("CAP"),
      timestamp: new Date().toISOString(),
    };
  }

  getCase(caseId: string): CAPCase | null {
    return this.cases.get(caseId) || null;
  }

  clear(): void {
    this.cases.clear();
  }
}

export const actionRouter = new ActionRouter();
