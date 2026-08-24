/**
 * Incident Service & State Machine for Raksha Core
 */

import {
  CreateIncidentInput,
  FraudIncident,
  IncidentState,
  IncidentValidation,
  PROTOCOL_VERSION,
} from "@raksha/schemas";
import { generateIncidentId, globalEventBus } from "@raksha/shared";
import { ValidationEngine } from "./validation-engine.js";
import { evidenceService } from "./evidence-service.js";

export class IncidentService {
  private incidents: Map<string, FraudIncident> = new Map();

  async createIncident(input: CreateIncidentInput): Promise<FraudIncident> {
    const id = generateIncidentId("RKS");
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

    // Run initial validation
    incident.validation = ValidationEngine.validate(incident);
    if (incident.validation.status === "READY") {
      incident.state = "READY";
    }

    this.incidents.set(id, incident);

    await globalEventBus.emit({
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

    if (incident.state === "READY") {
      await globalEventBus.emit({
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
    }

    return incident;
  }

  async getIncident(id: string): Promise<FraudIncident | null> {
    return this.incidents.get(id) || null;
  }

  async listIncidents(): Promise<FraudIncident[]> {
    return Array.from(this.incidents.values());
  }

  async updateIncident(
    id: string,
    updates: Partial<FraudIncident>
  ): Promise<FraudIncident> {
    const incident = this.incidents.get(id);
    if (!incident) {
      throw new Error(`Incident not found: ${id}`);
    }

    const updated: FraudIncident = {
      ...incident,
      ...updates,
      narrative: {
        ...incident.narrative,
        ...(updates.narrative || {}),
      },
      reporter: {
        ...incident.reporter,
        ...(updates.reporter || {}),
      },
      transaction: {
        ...incident.transaction,
        ...(updates.transaction || {}),
      },
      handoff: {
        ...incident.handoff,
        ...(updates.handoff || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    // Re-validate after update
    updated.validation = ValidationEngine.validate(updated);
    if (updated.validation.status === "READY" && updated.state !== "ACKNOWLEDGED" && updated.state !== "SUBMITTED") {
      updated.state = "READY";
    }

    this.incidents.set(id, updated);

    await globalEventBus.emit({
      type: "case.updated",
      caseId: id,
      incidentId: id,
      source: "core",
      payload: { incidentId: id, state: updated.state },
    });

    return updated;
  }

  async validateIncident(id: string): Promise<IncidentValidation> {
    const incident = this.incidents.get(id);
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
    incident.updatedAt = new Date().toISOString();
    this.incidents.set(id, incident);

    return validation;
  }

  async transitionState(id: string, newState: IncidentState): Promise<FraudIncident> {
    const incident = this.incidents.get(id);
    if (!incident) {
      throw new Error(`Incident not found: ${id}`);
    }

    incident.state = newState;
    incident.updatedAt = new Date().toISOString();
    this.incidents.set(id, incident);

    await globalEventBus.emit({
      type: "case.updated",
      caseId: id,
      incidentId: id,
      source: "core",
      payload: { incidentId: id, state: newState },
    });

    return incident;
  }

  clear(): void {
    this.incidents.clear();
  }
}

export const incidentService = new IncidentService();
