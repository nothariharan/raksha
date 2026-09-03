/**
 * Persistent Incident Service & State Machine for Raksha Core
 */

import {
  CreateIncidentInput,
  FraudIncident,
  IncidentState,
  IncidentValidation,
  PROTOCOL_VERSION,
} from "@raksha/schemas";
import { globalEventBus } from "@raksha/shared";
import { normalizeMobile } from "@raksha/shared";
import { ValidationEngine } from "./validation-engine.js";
import {
  IIncidentRepository,
  defaultIncidentRepository,
  IEventRepository,
  defaultEventRepository,
  IEvidenceRepository,
  defaultEvidenceRepository,
} from "./repositories/index.js";
import { IdentityAllocator, defaultIdentityAllocator } from "./db/identity-allocator.js";

export class IncidentService {
  private incidentRepo: IIncidentRepository;
  private eventRepo: IEventRepository;
  private evidenceRepo: IEvidenceRepository;
  private ids: IdentityAllocator;

  constructor(
    incidentRepo?: IIncidentRepository,
    eventRepo?: IEventRepository,
    evidenceRepo?: IEvidenceRepository,
    ids?: IdentityAllocator
  ) {
    this.incidentRepo = incidentRepo || defaultIncidentRepository;
    this.eventRepo = eventRepo || defaultEventRepository;
    this.evidenceRepo = evidenceRepo || defaultEvidenceRepository;
    this.ids = ids || defaultIdentityAllocator;
  }

  async createIncident(input: CreateIncidentInput): Promise<FraudIncident> {
    const id = await this.ids.allocateIncidentId("RKS");
    const now = new Date().toISOString();

    const incident: FraudIncident = {
      id,
      protocolVersion: PROTOCOL_VERSION,
      type: "FINANCIAL_CYBER_FRAUD",
      narrative: {
        text: input.narrative.text,
        source: input.source,
      },
      reporter: {
        mobile: input.reporter?.mobile,
        name: input.reporter?.name,
        preferredLanguage: input.reporter?.preferredLanguage || "en",
        state: input.reporter?.state,
        district: input.reporter?.district,
      },
      transaction: {
        amount: input.transaction?.amount,
        currency: input.transaction?.currency || "INR",
        transactionId: input.transaction?.transactionId,
        timestamp: input.transaction?.timestamp,
        debitInstitution: input.transaction?.debitInstitution,
        beneficiaryIdentifier: input.transaction?.beneficiaryIdentifier,
        beneficiaryInstitution: input.transaction?.beneficiaryInstitution,
        channel: input.transaction?.channel || "UPI",
      },
      evidence: [],
      state: "INTAKE",
      validation: {
        status: "PENDING",
        missingFields: [],
        conflicts: [],
      },
      handoff: {
        target: "portal-a",
        status: "NOT_STARTED",
      },
      createdAt: now,
      updatedAt: now,
    };

    // Run deterministic validation
    incident.validation = ValidationEngine.validate(incident);
    if (incident.validation.status === "READY") {
      incident.state = "READY";
    }

    // Persist incident
    await this.incidentRepo.create(incident);

    // Emit & persist incident.created event
    const createdEvent = await globalEventBus.emit({
      type: "incident.created",
      caseId: id,
      incidentId: id,
      source: "core",
      payload: {
        incidentId: id,
        source: input.source,
        state: incident.state,
      },
    });
    await this.eventRepo.append(createdEvent);

    if (incident.state === "READY") {
      const readyEvent = await globalEventBus.emit({
        type: "incident.ready",
        caseId: id,
        incidentId: id,
        source: "core",
        payload: {
          incidentId: id,
          transactionAmount: incident.transaction.amount,
          transactionId: incident.transaction.transactionId,
        },
      });
      await this.eventRepo.append(readyEvent);
    }

    return incident;
  }

  /**
   * Find the most-recent open incident for a citizen mobile number.
   * Normalizes the mobile before lookup so "+91...", "91...", "0..." all resolve to the same key.
   * Returns null when no open case exists (caller should create one).
   */
  async findOpenByMobile(mobile: string): Promise<FraudIncident | null> {
    const normalized = normalizeMobile(mobile);
    if (!normalized) return null;
    return this.incidentRepo.findOpenByMobile(normalized);
  }

  async getIncident(id: string): Promise<FraudIncident | null> {
    const incident = await this.incidentRepo.findById(id);
    if (!incident) return null;

    // Attach current evidence IDs
    const evidenceItems = await this.evidenceRepo.findByIncidentId(id);
    incident.evidence = evidenceItems.map((e) => e.id);

    return incident;
  }

  async listIncidents(): Promise<FraudIncident[]> {
    const incidents = await this.incidentRepo.list();
    for (const inc of incidents) {
      const evidenceItems = await this.evidenceRepo.findByIncidentId(inc.id);
      inc.evidence = evidenceItems.map((e) => e.id);
    }
    return incidents;
  }

  async updateIncident(
    id: string,
    updates: Partial<FraudIncident>
  ): Promise<FraudIncident> {
    const existing = await this.incidentRepo.findById(id);
    if (!existing) {
      throw new Error(`Incident not found: ${id}`);
    }

    const updated: FraudIncident = {
      ...existing,
      ...updates,
      narrative: {
        ...existing.narrative,
        ...(updates.narrative || {}),
      },
      reporter: {
        ...existing.reporter,
        ...(updates.reporter || {}),
      },
      transaction: {
        ...existing.transaction,
        ...(updates.transaction || {}),
      },
      handoff: {
        ...existing.handoff,
        ...(updates.handoff || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    // Re-validate after update
    updated.validation = ValidationEngine.validate(updated);
    if (
      updated.validation.status === "READY" &&
      updated.state !== "ACKNOWLEDGED" &&
      updated.state !== "SUBMITTED"
    ) {
      updated.state = "READY";
    }

    await this.incidentRepo.update(id, updated);

    const event = await globalEventBus.emit({
      type: "case.updated",
      caseId: id,
      incidentId: id,
      source: "core",
      payload: { incidentId: id, state: updated.state },
    });
    await this.eventRepo.append(event);

    return updated;
  }

  async validateIncident(id: string): Promise<IncidentValidation> {
    const incident = await this.getIncident(id);
    if (!incident) {
      throw new Error(`Incident not found: ${id}`);
    }

    const validation = ValidationEngine.validate(incident);
    incident.validation = validation;
    if (validation.status === "READY" && incident.state === "INTAKE") {
      incident.state = "READY";
    } else if (validation.status === "INCOMPLETE") {
      incident.state = "QUESTION_PENDING";
    } else if (validation.status === "CONFLICT") {
      incident.state = "USER_CONFIRMATION";
    }

    await this.incidentRepo.update(id, {
      validation,
      state: incident.state,
    });

    const event = await globalEventBus.emit({
      type: "validation.completed",
      caseId: id,
      incidentId: id,
      source: "core",
      payload: { incidentId: id, validationStatus: validation.status },
    });
    await this.eventRepo.append(event);

    return validation;
  }

  async transitionState(id: string, newState: IncidentState): Promise<FraudIncident> {
    const incident = await this.getIncident(id);
    if (!incident) {
      throw new Error(`Incident not found: ${id}`);
    }

    incident.state = newState;
    await this.incidentRepo.update(id, { state: newState });

    const event = await globalEventBus.emit({
      type: "case.updated",
      caseId: id,
      incidentId: id,
      source: "core",
      payload: { incidentId: id, state: newState },
    });
    await this.eventRepo.append(event);

    return incident;
  }

  async getIncidentEvents(incidentId: string) {
    return this.eventRepo.findByIncidentId(incidentId);
  }

  async clear(): Promise<void> {
    await this.incidentRepo.clear();
    await this.eventRepo.clear();
    await this.evidenceRepo.clear();
  }
}

export const incidentService = new IncidentService();
