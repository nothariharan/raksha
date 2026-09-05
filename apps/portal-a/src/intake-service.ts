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
  /** Citizen-facing timeline rows (simulated 1930 desk). */
  timeline: Array<{ at: string; label: string }>;
}

const SIMULATION_BOUNDARY =
  "Simulated downstream service — 1930 / bank response for prototype";

let portalCaseCounter = 1;

export class PortalAIntakeService {
  private capClient: ICAPClient;
  private localCases: Map<string, PortalACase> = new Map();
  private unsubscribe?: () => void;
  private unsubscribeFollowUp?: () => void;
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
    this.unsubscribeFollowUp = globalEventBus.subscribe(
      "case.followed_up",
      async (event: CAPEvent) => {
        await this.ingestFollowUpEvent(event);
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
    const receivedAt = event.timestamp || new Date().toISOString();
    const portalCase: PortalACase = {
      portalCaseId,
      capCaseId: payload.caseId,
      externalReference: payload.externalReference || `1930-SYN-${payload.caseId}`,
      status: "ACCEPTED",
      lifecycle: "ACCEPTED",
      incidentId: payload.incidentId,
      incident,
      receivedAt,
      summary: `Cyber Fraud Report: ₹${incident.transaction?.amount || 0} via ${incident.transaction?.channel || "UPI"}`,
      timeline: [
        { at: receivedAt, label: "Report received" },
        { at: receivedAt, label: "Acknowledged" },
      ],
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

  /** Append citizen follow-up to the local 1930 timeline — no operator click. */
  async ingestFollowUpEvent(event: CAPEvent): Promise<PortalACase | null> {
    const payload = (event.payload || {}) as {
      incidentId?: string;
      caseId?: string;
    };
    const portalCase =
      (payload.caseId ? this.getPortalCaseByCapId(payload.caseId) : null) ||
      (payload.incidentId ? this.getPortalCaseByIncidentId(payload.incidentId) : null);
    if (!portalCase) return null;
    const at = event.timestamp || new Date().toISOString();
    if (!portalCase.timeline) portalCase.timeline = [];
    if (!portalCase.timeline.some((row) => row.label === "Citizen follow-up received")) {
      portalCase.timeline.push({ at, label: "Citizen follow-up received" });
    }
    this.localCases.set(portalCase.portalCaseId, portalCase);
    return portalCase;
  }

  /**
   * HTTP poll fallback for multi-process deployments where EventBus is not shared.
   * Always used on GET /portal-a/cases so localhost:3003 shows filings from CAP :3002.
   */
  private resolveCapBaseUrl(): string {
    const configured = (process.env.CAP_PUBLIC_BASE_URL || "").replace(/\/$/, "");
    if (
      configured &&
      !/localhost|127\.0\.0\.1/i.test(configured)
    ) {
      return configured;
    }
    // Unified Render/prod host: CAP shares this process — poll loopback on PORT.
    if (
      process.env.RAKSHA_UNIFIED_HOST === "1" ||
      process.env.RENDER ||
      (configured && /127\.0\.0\.1/i.test(configured))
    ) {
      const port = process.env.PORT || "3000";
      return `http://127.0.0.1:${port}`;
    }
    const origin = (
      process.env.PROTOCOL_PUBLIC_ORIGIN ||
      process.env.RENDER_EXTERNAL_URL ||
      ""
    ).replace(/\/$/, "");
    if (origin && !/localhost|127\.0\.0\.1/i.test(origin)) return origin;
    return configured || "http://localhost:3002";
  }

  async pollEventsFromHttp(): Promise<PortalACase[]> {
    const baseUrl = this.resolveCapBaseUrl();
    // If local store is empty (portal restarted / separate process), re-read full history.
    const sinceParam =
      this.localCases.size > 0 && this.lastPolledTimestamp
        ? `&since=${encodeURIComponent(this.lastPolledTimestamp)}`
        : "";
    try {
      const res = await fetch(`${baseUrl}/cap/events?type=incident.accepted${sinceParam}`);
      if (res.ok) {
        const data = (await res.json()) as {
          events: Array<CAPEvent<IncidentAcceptedEventPayload>>;
        };
        for (const ev of data.events || []) {
          await this.ingestAcceptedEvent(ev);
          if (ev.timestamp) this.lastPolledTimestamp = ev.timestamp;
        }
      }

      const followRes = await fetch(`${baseUrl}/cap/events?type=case.followed_up${sinceParam}`);
      if (followRes.ok) {
        const data = (await followRes.json()) as { events: CAPEvent[] };
        for (const ev of data.events || []) {
          await this.ingestFollowUpEvent(ev);
          if (ev.timestamp) this.lastPolledTimestamp = ev.timestamp;
        }
      }
    } catch (err) {
      console.warn(
        "[Portal A] CAP event poll failed:",
        (err as Error).message || err,
        `(${baseUrl})`
      );
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

  getPortalCaseByExternalReference(ref: string): PortalACase | null {
    const needle = (ref || "").trim().toLowerCase();
    if (!needle) return null;
    return (
      Array.from(this.localCases.values()).find(
        (c) => (c.externalReference || "").trim().toLowerCase() === needle
      ) || null
    );
  }

  listPortalCases(): PortalACase[] {
    return Array.from(this.localCases.values());
  }

  destroy(): void {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeFollowUp) this.unsubscribeFollowUp();
  }

  clear(): void {
    this.localCases.clear();
    portalCaseCounter = 1;
    this.lastPolledTimestamp = undefined;
  }
}

export const portalAIntakeService = new PortalAIntakeService();
