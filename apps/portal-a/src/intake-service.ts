/**
 * Portal A — Cyber Fraud Intake Service (simulated 1930)
 *
 * Event-driven happy path:
 *   incident.accepted (from CAP)
 *     → ingest local 1930-SYN case
 *     → emit service.accepted
 *
 * reportFraudIncident() remains for the Portal A UI form (developer/demo utility),
 * but the citizen confirmation path must NOT require calling it.
 */

import {
  FraudIncident,
  CAPActionResponse,
  CAPEvent,
  IncidentAcceptedEventPayload,
  ServiceAcceptedEventPayload,
} from "@raksha/schemas";
import { createCAPClient, ICAPClient } from "@raksha/cap-sdk";
import { globalEventBus } from "@raksha/shared";
import {
  PortalALifecycle,
  nextLifecycle,
  transitionLifecycle,
} from "./state-machine.js";

export interface PortalACase {
  portalCaseId: string;
  capCaseId: string;
  externalReference: string;
  /** CAP case status mirrored from the last CAP response. */
  status: "ACCEPTED" | "REJECTED" | "INVESTIGATING" | "CLOSED";
  lifecycle: PortalALifecycle;
  incidentId: string;
  incident: FraudIncident;
  receivedAt: string;
  summary: string;
}

const SIMULATION_BOUNDARY =
  "SIMULATED DEMONSTRATION — CAP event pipeline is real; 1930 / bank systems are simulated.";

let portalCaseCounter = 1;

export class PortalAIntakeService {
  private capClient: ICAPClient;
  private localCases: Map<string, PortalACase> = new Map();
  private unsubscribe?: () => void;
  private lastPolledTimestamp?: string;

  constructor(capClient?: ICAPClient) {
    this.capClient =
      capClient ||
      createCAPClient({
        mode: process.env.CAP_MODE === "in-memory" ? "in-memory" : "http",
        baseUrl: process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002",
      });
    this.initSubscription();
  }

  private initSubscription(): void {
    this.unsubscribe = globalEventBus.subscribe<IncidentAcceptedEventPayload>(
      "incident.accepted",
      async (event: CAPEvent<IncidentAcceptedEventPayload>) => {
        await this.ingestAcceptedEvent(event);
      }
    );
  }

  /**
   * Ingest a CAP incident.accepted event into Portal A's local 1930 case store.
   * Does NOT call CAP again — CAP already owns the case.
   */
  async ingestAcceptedEvent(
    event: CAPEvent<IncidentAcceptedEventPayload>
  ): Promise<PortalACase | null> {
    const payload = event.payload;
    if (!payload?.caseId || !payload?.incidentId) return null;

    const existing = this.getPortalCaseByCapId(payload.caseId);
    if (existing) return existing;

    let incident: FraudIncident | null =
      payload.incident && typeof payload.incident === "object"
        ? (payload.incident as FraudIncident)
        : null;

    if (!incident) {
      try {
        const capCase = await this.capClient.getCase(payload.caseId);
        if (capCase?.payload && typeof capCase.payload === "object" && "id" in (capCase.payload as object)) {
          incident = capCase.payload as FraudIncident;
        }
      } catch {
        // leave null
      }
    }

    if (!incident) {
      // Minimal stub so the portal still shows the case
      incident = {
        id: payload.incidentId,
        protocolVersion: "raksha/0.1",
        type: "FINANCIAL_CYBER_FRAUD",
        narrative: { text: "", source: "whatsapp" },
        reporter: { preferredLanguage: "en", consentToShare: true },
        transaction: { currency: "INR" },
        evidence: [],
        state: "SUBMITTED",
        validation: { status: "READY", missingFields: [], conflicts: [], warnings: [] },
        handoff: {
          target: "portal-a",
          status: "ACCEPTED",
          externalReference: payload.externalReference,
        },
        createdAt: event.timestamp,
        updatedAt: event.timestamp,
      } as unknown as FraudIncident;
    }

    const portalCaseId = `PA-${String(portalCaseCounter++).padStart(6, "0")}`;
    const portalCase: PortalACase = {
      portalCaseId,
      capCaseId: payload.caseId,
      externalReference: payload.externalReference || `1930-SYN-${payload.caseId}`,
      status: "ACCEPTED",
      lifecycle: "ACCEPTED",
      incidentId: payload.incidentId,
      incident,
      receivedAt: event.timestamp || new Date().toISOString(),
      summary: `Cyber Fraud Report: ₹${incident.transaction?.amount || 0} via ${incident.transaction?.channel || "UPI"}`,
    };

    this.localCases.set(portalCaseId, portalCase);

    const servicePayload: ServiceAcceptedEventPayload = {
      incidentId: portalCase.incidentId,
      caseId: portalCase.capCaseId,
      portalCaseId: portalCase.portalCaseId,
      externalReference: portalCase.externalReference,
      portal: "portal-a",
      lifecycle: portalCase.lifecycle,
      simulationBoundary: SIMULATION_BOUNDARY,
    };

    try {
      await this.capClient.emitEvent({
        type: "service.accepted",
        caseId: portalCase.capCaseId,
        incidentId: portalCase.incidentId,
        source: "portal-a",
        payload: servicePayload,
      });
    } catch {
      // Fallback: same-process EventBus when CAP HTTP is unreachable
      await globalEventBus.emit({
        type: "service.accepted",
        caseId: portalCase.capCaseId,
        incidentId: portalCase.incidentId,
        source: "portal-a",
        payload: servicePayload,
      });
    }

    return portalCase;
  }

  /**
   * HTTP poll fallback for multi-process deployments where EventBus is not shared.
   */
  async pollEventsFromHttp(): Promise<PortalACase[]> {
    const baseUrl = process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
    const sinceParam = this.lastPolledTimestamp
      ? `&since=${encodeURIComponent(this.lastPolledTimestamp)}`
      : "";
    try {
      const res = await fetch(`${baseUrl}/cap/events?type=incident.accepted${sinceParam}`);
      if (!res.ok) return this.listPortalCases();
      const data = (await res.json()) as {
        events: Array<CAPEvent<IncidentAcceptedEventPayload>>;
      };
      for (const ev of data.events || []) {
        await this.ingestAcceptedEvent(ev);
        this.lastPolledTimestamp = ev.timestamp;
      }
    } catch {
      // keep local store
    }
    return this.listPortalCases();
  }

  /**
   * Developer/UI path: Portal A form submits through CAP.
   * Not required for the citizen confirmation happy path.
   */
  async reportFraudIncident(
    incident: FraudIncident,
    idempotencyKey?: string
  ): Promise<{
    success: boolean;
    portalCase: PortalACase | null;
    capResponse: CAPActionResponse;
  }> {
    const capResponse = await this.capClient.executeAction(
      "report_financial_fraud",
      { incident },
      idempotencyKey
    );

    if (!capResponse.success) {
      return {
        success: false,
        portalCase: null,
        capResponse,
      };
    }

    // Prefer event-ingest path; if EventBus already delivered, return that case.
    let portalCase = this.getPortalCaseByCapId(capResponse.caseId);
    if (!portalCase) {
      portalCase = await this.ingestAcceptedEvent({
        id: `EVT-LOCAL-${Date.now()}`,
        type: "incident.accepted",
        caseId: capResponse.caseId,
        incidentId: incident.id,
        source: "portal-a-fallback",
        timestamp: new Date().toISOString(),
        payload: {
          caseId: capResponse.caseId,
          incidentId: incident.id,
          externalReference: capResponse.externalReference || `1930-SYN-${capResponse.caseId}`,
          targetPortal: "portal-a",
          status: "ACCEPTED",
          incident,
          simulationBoundary: SIMULATION_BOUNDARY,
        },
      });
    }

    return {
      success: true,
      portalCase,
      capResponse,
    };
  }

  async acknowledgeCase(portalCaseId: string): Promise<PortalACase | null> {
    const portalCase = this.localCases.get(portalCaseId);
    if (!portalCase) return null;

    const target = nextLifecycle(portalCase.lifecycle);
    if (!target) {
      return portalCase;
    }

    portalCase.lifecycle = transitionLifecycle(portalCase.lifecycle, target);
    const capCase = await this.capClient.getCase(portalCase.capCaseId);
    if (capCase?.status) {
      if (capCase.status === "ACCEPTED") portalCase.status = "ACCEPTED";
    }

    await this.capClient.emitEvent({
      type: "case.updated",
      caseId: portalCase.capCaseId,
      incidentId: portalCase.incidentId,
      source: "portal-a",
      payload: {
        portalCaseId: portalCase.portalCaseId,
        lifecycle: portalCase.lifecycle,
      },
    });

    this.localCases.set(portalCaseId, portalCase);
    return portalCase;
  }

  getPortalCase(portalCaseId: string): PortalACase | null {
    return this.localCases.get(portalCaseId) || null;
  }

  getPortalCaseByCapId(capCaseId: string): PortalACase | null {
    return Array.from(this.localCases.values()).find((c) => c.capCaseId === capCaseId) || null;
  }

  getPortalCaseByIncidentId(incidentId: string): PortalACase | null {
    return Array.from(this.localCases.values()).find((c) => c.incidentId === incidentId) || null;
  }

  listPortalCases(): PortalACase[] {
    return Array.from(this.localCases.values());
  }

  destroy(): void {
    if (this.unsubscribe) this.unsubscribe();
  }

  clear(): void {
    this.localCases.clear();
    portalCaseCounter = 1;
    this.lastPolledTimestamp = undefined;
  }
}

export const portalAIntakeService = new PortalAIntakeService();
