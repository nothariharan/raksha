/**
 * Persistent Action Router for CAP
 * Executes typed actions with idempotency protection and event persistence.
 *
 * Happy-path autonomy contract:
 *   report_financial_fraud → incident.accepted (exactly once per incident)
 *   → Portal A / Portal B / WhatsApp react via EventBus subscribers
 *   (no developer scripts in the chain)
 */

import {
  CAPActionName,
  CAPActionResponse,
  CAPCase,
  FraudIncident,
  AcknowledgeResponsePayload,
} from "@raksha/schemas";
import {
  generateExternalReference,
  globalEventBus,
} from "@raksha/shared";
import {
  ICaseRepository,
  defaultCaseRepository,
  IEventRepository,
  defaultEventRepository,
  IActionRepository,
  defaultActionRepository,
  IIncidentRepository,
  defaultIncidentRepository,
  IdentityAllocator,
  defaultIdentityAllocator,
} from "@raksha/core";
import { capabilityRegistry } from "./capability-registry.js";

const SIMULATION_BOUNDARY =
  "SIMULATED DEMONSTRATION — CAP event pipeline is real; 1930 / bank systems are simulated.";

export class ActionRouter {
  private caseRepo: ICaseRepository;
  private eventRepo: IEventRepository;
  private actionRepo: IActionRepository;
  private incidentRepo: IIncidentRepository;
  private ids: IdentityAllocator;

  constructor(
    caseRepo?: ICaseRepository,
    eventRepo?: IEventRepository,
    actionRepo?: IActionRepository,
    ids?: IdentityAllocator,
    incidentRepo?: IIncidentRepository
  ) {
    this.caseRepo = caseRepo || defaultCaseRepository;
    this.eventRepo = eventRepo || defaultEventRepository;
    this.actionRepo = actionRepo || defaultActionRepository;
    this.ids = ids || defaultIdentityAllocator;
    this.incidentRepo = incidentRepo || defaultIncidentRepository;
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

  private extractIncident(payload: unknown): FraudIncident {
    const p = payload as { incident?: FraudIncident } | FraudIncident;
    return ("incident" in (p as object) && (p as { incident?: FraudIncident }).incident
      ? (p as { incident: FraudIncident }).incident
      : (p as FraudIncident));
  }

  private async responseFromExistingCase(capCase: CAPCase): Promise<CAPActionResponse> {
    return {
      success: true,
      status: capCase.status === "ACTION_TAKEN" ? "ACTION_TAKEN" : "ACCEPTED",
      caseId: capCase.id,
      externalReference: capCase.externalReference,
      data: {
        caseId: capCase.id,
        status: capCase.status,
        externalReference: capCase.externalReference,
        idempotentReplay: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async executeAction<T = unknown, R = unknown>(
    action: CAPActionName,
    payload: T,
    idempotencyKey?: string
  ): Promise<CAPActionResponse<R>> {
    // 1. Idempotency Check (explicit key)
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
      const incident = this.extractIncident(payload);

      // Semantic idempotency: one CAP case per incident for report_financial_fraud
      const existingCase = await this.caseRepo.findByIncidentId(incident.id);
      if (existingCase) {
        const replay = (await this.responseFromExistingCase(existingCase)) as CAPActionResponse<R>;
        if (idempotencyKey) {
          await this.actionRepo.record({
            id: await this.ids.allocateEventId("ACT"),
            actionName: action,
            caseId: existingCase.id,
            incidentId: incident.id,
            status: "ACCEPTED",
            idempotencyKey,
            requestPayload: payload,
            responsePayload: replay,
            executedAt: new Date().toISOString(),
          });
        }
        return replay;
      }

      const caseId = await this.ids.allocateCaseId("CAP");
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

      // Persist civic handoff on the Core incident (best-effort; never blocks CAP accept)
      try {
        const stored = await this.incidentRepo.findById(incident.id);
        if (stored) {
          await this.incidentRepo.update(incident.id, {
            state: "SUBMITTED",
            handoff: {
              ...stored.handoff,
              target: "portal-a",
              status: "ACCEPTED",
              externalReference: externalRef,
              submittedAt: now,
              nextRequiredAction: "Await simulated 1930 / bank response",
            },
          });
        }
      } catch (err) {
        console.warn("[CAP] Could not mark incident SUBMITTED:", (err as Error).message);
      }

      const acceptedPayload = {
        caseId,
        incidentId: incident.id,
        externalReference: externalRef,
        targetPortal: "portal-a",
        status: "ACCEPTED",
        incident,
        simulationBoundary: SIMULATION_BOUNDARY,
      };

      const event = await globalEventBus.emit({
        type: "incident.accepted",
        caseId,
        incidentId: incident.id,
        source: "cap",
        payload: acceptedPayload,
      });
      await this.eventRepo.append(event);

      const response: CAPActionResponse<R> = {
        success: true,
        status: "ACCEPTED",
        caseId,
        externalReference: externalRef,
        data: {
          caseId,
          status: "ACCEPTED",
          externalReference: externalRef,
          simulationBoundary: SIMULATION_BOUNDARY,
        } as unknown as R,
        timestamp: now,
      };

      // Always record the action for audit (use incident-scoped key if none supplied)
      const recordKey = idempotencyKey || `cap-report-${incident.id}`;
      await this.actionRepo.record({
        id: await this.ids.allocateEventId("ACT"),
        actionName: action,
        caseId,
        incidentId: incident.id,
        status: "ACCEPTED",
        idempotencyKey: recordKey,
        requestPayload: payload,
        responsePayload: response,
        executedAt: now,
      });

      // WhatsApp / Portal A / Portal B are EventBus subscribers — no direct notify here.
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

      // Idempotent replay if already actioned
      if (existing.status === "ACTION_TAKEN") {
        const replay = (await this.responseFromExistingCase(existing)) as CAPActionResponse<R>;
        return replay;
      }

      const updatedCase = await this.caseRepo.update(ack.caseId, {
        status: "ACTION_TAKEN",
      });

      try {
        const stored = await this.incidentRepo.findById(
          ack.incidentId || existing.incidentId
        );
        if (stored) {
          await this.incidentRepo.update(stored.id, {
            state: "ACKNOWLEDGED",
            handoff: {
              ...stored.handoff,
              status: "ACKNOWLEDGED",
              acknowledgedAt: new Date().toISOString(),
              nextRequiredAction: undefined,
            },
          });
        }
      } catch (err) {
        console.warn("[CAP] Could not mark incident ACKNOWLEDGED:", (err as Error).message);
      }

      const event = await globalEventBus.emit({
        type: "response.acknowledged",
        caseId: ack.caseId,
        incidentId: ack.incidentId || existing.incidentId,
        source: "portal-b",
        payload: {
          ...ack,
          simulationBoundary: SIMULATION_BOUNDARY,
        },
      });
      await this.eventRepo.append(event);

      const response: CAPActionResponse<R> = {
        success: true,
        status: "ACTION_TAKEN",
        caseId: ack.caseId,
        externalReference: updatedCase.externalReference,
        data: {
          caseId: ack.caseId,
          status: "ACTION_TAKEN",
          simulationBoundary: SIMULATION_BOUNDARY,
        } as unknown as R,
        timestamp: new Date().toISOString(),
      };

      const recordKey = idempotencyKey || `cap-ack-${ack.caseId}-${ack.actionTaken}`;
      await this.actionRepo.record({
        id: await this.ids.allocateEventId("ACT"),
        actionName: action,
        caseId: ack.caseId,
        incidentId: ack.incidentId || existing.incidentId,
        status: "ACTION_TAKEN",
        idempotencyKey: recordKey,
        requestPayload: payload,
        responsePayload: response,
        executedAt: new Date().toISOString(),
      });

      return response;
    }

    const defaultResponse: CAPActionResponse<R> = {
      success: true,
      status: "ACCEPTED",
      caseId: await this.ids.allocateCaseId("CAP"),
      timestamp: new Date().toISOString(),
    };

    return defaultResponse;
  }

  async getCase(caseId: string): Promise<CAPCase | null> {
    return this.caseRepo.findById(caseId);
  }

  async getCaseByIncidentId(incidentId: string): Promise<CAPCase | null> {
    return this.caseRepo.findByIncidentId(incidentId);
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
