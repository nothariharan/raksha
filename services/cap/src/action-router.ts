/**
 * Persistent Action Router for CAP
 * Executes typed actions with idempotency protection and event persistence.
 */

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
  generateEventId,
  globalEventBus,
} from "@raksha/shared";
import {
  ICaseRepository,
  defaultCaseRepository,
  IEventRepository,
  defaultEventRepository,
  IActionRepository,
  defaultActionRepository,
} from "@raksha/core";
import { capabilityRegistry } from "./capability-registry.js";

export class ActionRouter {
  private caseRepo: ICaseRepository;
  private eventRepo: IEventRepository;
  private actionRepo: IActionRepository;

  constructor(
    caseRepo?: ICaseRepository,
    eventRepo?: IEventRepository,
    actionRepo?: IActionRepository
  ) {
    this.caseRepo = caseRepo || defaultCaseRepository;
    this.eventRepo = eventRepo || defaultEventRepository;
    this.actionRepo = actionRepo || defaultActionRepository;
  }

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
    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingAction = await this.actionRepo.findByIdempotencyKey(idempotencyKey);
      if (existingAction && existingAction.responsePayload) {
        return existingAction.responsePayload as CAPActionResponse<R>;
      }
    }

    // 2. Validate Action
    const validation = await this.validateAction(action, payload);
    if (!validation.valid) {
      const response: CAPActionResponse<R> = {
        success: false,
        status: "REJECTED",
        caseId: "",
        error: validation.errors.join("; "),
        timestamp: new Date().toISOString(),
      };
      return response;
    }

    // 3. Handle 'report_financial_fraud'
    if (action === "report_financial_fraud") {
      const p = payload as { incident?: FraudIncident } | FraudIncident;
      const incident = "incident" in p && p.incident ? p.incident : (p as FraudIncident);

      const caseId = generateCaseId("CAP");
      const externalRef = generateExternalReference("1930");
      const now = new Date().toISOString();

      const capCase: CAPCase = {
        id: caseId,
        incidentId: incident.id,
        status: "ACCEPTED",
        externalReference: externalRef,
        targetService: "portal-a",
        action: "report_financial_fraud",
        payload: incident,
        createdAt: now,
        updatedAt: now,
      };

      await this.caseRepo.create(capCase);

      const event = await globalEventBus.emit({
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
      await this.eventRepo.append(event);

      const response: CAPActionResponse<R> = {
        success: true,
        status: "ACCEPTED",
        caseId,
        externalReference: externalRef,
        data: { caseId, status: "ACCEPTED", externalReference: externalRef } as unknown as R,
        timestamp: now,
      };

      if (idempotencyKey) {
        await this.actionRepo.record({
          id: generateEventId("ACT"),
          actionName: action,
          caseId,
          incidentId: incident.id,
          status: "ACCEPTED",
          idempotencyKey,
          requestPayload: payload,
          responsePayload: response,
          executedAt: now,
        });
      }

      return response;
    }

    // 4. Handle 'acknowledge_response'
    if (action === "acknowledge_response") {
      const ack = payload as AcknowledgeResponsePayload;
      const existing = await this.caseRepo.findById(ack.caseId);
      if (!existing) {
        return {
          success: false,
          status: "REJECTED",
          caseId: ack.caseId,
          error: `Case not found: ${ack.caseId}`,
          timestamp: new Date().toISOString(),
        };
      }

      const updatedCase = await this.caseRepo.update(ack.caseId, {
        status: "ACTION_TAKEN",
      });

      const event = await globalEventBus.emit({
        type: "response.acknowledged",
        caseId: ack.caseId,
        incidentId: ack.incidentId || existing.incidentId,
        source: "portal-b",
        payload: ack,
      });
      await this.eventRepo.append(event);

      const response: CAPActionResponse<R> = {
        success: true,
        status: "ACTION_TAKEN",
        caseId: ack.caseId,
        externalReference: updatedCase.externalReference,
        data: { caseId: ack.caseId, status: "ACTION_TAKEN" } as unknown as R,
        timestamp: new Date().toISOString(),
      };

      if (idempotencyKey) {
        await this.actionRepo.record({
          id: generateEventId("ACT"),
          actionName: action,
          caseId: ack.caseId,
          incidentId: ack.incidentId || existing.incidentId,
          status: "ACTION_TAKEN",
          idempotencyKey,
          requestPayload: payload,
          responsePayload: response,
          executedAt: new Date().toISOString(),
        });
      }

      return response;
    }

    const defaultResponse: CAPActionResponse<R> = {
      success: true,
      status: "ACCEPTED",
      caseId: generateCaseId("CAP"),
      timestamp: new Date().toISOString(),
    };

    return defaultResponse;
  }

  async getCase(caseId: string): Promise<CAPCase | null> {
    return this.caseRepo.findById(caseId);
  }

  async getCaseEvents(caseId: string) {
    return this.eventRepo.findByCaseId(caseId);
  }

  async clear(): Promise<void> {
    await this.caseRepo.clear();
    await this.eventRepo.clear();
    await this.actionRepo.clear();
  }
}

export const actionRouter = new ActionRouter();
