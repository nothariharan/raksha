/**
 * Portal B — Financial Institution Response Console Service
 *
 * Event-driven happy path:
 *   incident.accepted → local alert PENDING_REVIEW
 *   service.accepted  → autonomous simulated LIEN_MARKED via CAP acknowledge_response
 *
 * No operator click required for the hackathon simulation path.
 */

import {
  CAPActionResponse,
  CAPEvent,
  IncidentAcceptedEventPayload,
  ServiceAcceptedEventPayload,
} from "@raksha/schemas";
import { createCAPClient, ICAPClient } from "@raksha/cap-sdk";
import { globalEventBus } from "@raksha/shared";
import { PortalBLifecycle, nextLifecycle, transitionLifecycle } from "./state-machine.js";

export interface ReceivedAlert {
  caseId: string;
  incidentId: string;
  externalReference: string;
  receivedAt: string;
  status: "PENDING_REVIEW" | "LIEN_MARKED" | "ACCOUNT_FROZEN";
  lifecycle: PortalBLifecycle;
  portalCaseId?: string;
  autoAcknowledged?: boolean;
}

const SIMULATION_BOUNDARY =
  "SIMULATED DEMONSTRATION — CAP event pipeline is real; 1930 / bank systems are simulated.";

export class PortalBResponseService {
  private capClient: ICAPClient;
  private alerts: Map<string, ReceivedAlert> = new Map();
  private unsubscribeAccepted?: () => void;
  private unsubscribeService?: () => void;
  private lastPolledTimestamp?: string;
  private autoAckInFlight = new Set<string>();

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
    this.unsubscribeAccepted = globalEventBus.subscribe<IncidentAcceptedEventPayload>(
      "incident.accepted",
      (event: CAPEvent<IncidentAcceptedEventPayload>) => {
        this.upsertAlertFromAccepted(event);
      }
    );

    this.unsubscribeService = globalEventBus.subscribe<ServiceAcceptedEventPayload>(
      "service.accepted",
      async (event: CAPEvent<ServiceAcceptedEventPayload>) => {
        await this.handleServiceAccepted(event);
      }
    );
  }

  private upsertAlertFromAccepted(
    event: CAPEvent<IncidentAcceptedEventPayload>
  ): ReceivedAlert {
    const payload = event.payload;
    const existing = this.alerts.get(event.caseId);
    if (existing) return existing;

    const alert: ReceivedAlert = {
      caseId: event.caseId,
      incidentId: payload.incidentId,
      externalReference: payload.externalReference,
      receivedAt: event.timestamp,
      status: "PENDING_REVIEW",
      lifecycle: "NEW",
    };
    this.alerts.set(event.caseId, alert);
    return alert;
  }

  private async handleServiceAccepted(
    event: CAPEvent<ServiceAcceptedEventPayload>
  ): Promise<void> {
    const payload = event.payload;
    let alert = this.alerts.get(event.caseId);
    if (!alert) {
      alert = {
        caseId: event.caseId,
        incidentId: payload.incidentId,
        externalReference: payload.externalReference,
        receivedAt: event.timestamp,
        status: "PENDING_REVIEW",
        lifecycle: "NEW",
        portalCaseId: payload.portalCaseId,
      };
      this.alerts.set(event.caseId, alert);
    } else {
      alert.portalCaseId = payload.portalCaseId;
    }

    // Autonomous simulated bank response — no human Portal B click
    await this.autoAcknowledgeLien(alert);
  }

  private async autoAcknowledgeLien(alert: ReceivedAlert): Promise<void> {
    if (alert.lifecycle === "ACKNOWLEDGED" || alert.status === "LIEN_MARKED") return;
    if (this.autoAckInFlight.has(alert.caseId)) return;
    this.autoAckInFlight.add(alert.caseId);

    try {
      await this.acknowledgeFreeze({
        caseId: alert.caseId,
        incidentId: alert.incidentId,
        responderInstitution:
          "State Bank of India (Simulated Financial Response)",
        actionTaken: "LIEN_MARKED",
        operatorNotes: `${SIMULATION_BOUNDARY} Autonomous Portal B response after service.accepted.`,
        idempotencyKey: `portal-b-auto-lien-${alert.caseId}`,
      });
      alert.autoAcknowledged = true;
    } catch (err) {
      console.error("[Portal B] Auto-ack failed:", err);
    } finally {
      this.autoAckInFlight.delete(alert.caseId);
    }
  }

  async pollEventsFromHttp(): Promise<ReceivedAlert[]> {
    const baseUrl = process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
    const sinceParam = this.lastPolledTimestamp
      ? `&since=${encodeURIComponent(this.lastPolledTimestamp)}`
      : "";
    try {
      const res = await fetch(
        `${baseUrl}/cap/events?type=incident.accepted${sinceParam}`
      );
      if (!res.ok) return this.listAlerts();
      const data = (await res.json()) as {
        events: Array<CAPEvent<IncidentAcceptedEventPayload>>;
      };
      for (const ev of data.events || []) {
        this.upsertAlertFromAccepted(ev);
        this.lastPolledTimestamp = ev.timestamp;
      }

      const res2 = await fetch(
        `${baseUrl}/cap/events?type=service.accepted${sinceParam}`
      );
      if (res2.ok) {
        const data2 = (await res2.json()) as {
          events: Array<CAPEvent<ServiceAcceptedEventPayload>>;
        };
        for (const ev of data2.events || []) {
          await this.handleServiceAccepted(ev);
          this.lastPolledTimestamp = ev.timestamp;
        }
      }
    } catch {
      // Fallback to local store
    }
    return this.listAlerts();
  }

  async acknowledgeFreeze(params: {
    caseId: string;
    incidentId: string;
    responderInstitution: string;
    actionTaken: "LIEN_MARKED" | "ACCOUNT_FROZEN" | "TRANSACTION_TRACED" | "FLAGGED_FOR_REVIEW";
    operatorNotes?: string;
    idempotencyKey?: string;
  }): Promise<CAPActionResponse> {
    const alert = this.alerts.get(params.caseId);
    if (alert) {
      alert.status = params.actionTaken === "ACCOUNT_FROZEN" ? "ACCOUNT_FROZEN" : "LIEN_MARKED";
      alert.lifecycle = "ACKNOWLEDGED";
    }

    return this.capClient.executeAction(
      "acknowledge_response",
      params,
      params.idempotencyKey || `ack-${params.caseId}-${params.actionTaken}`
    );
  }

  async advanceAlertLifecycle(caseId: string): Promise<ReceivedAlert | null> {
    const alert = this.alerts.get(caseId);
    if (!alert) return null;

    const next = nextLifecycle(alert.lifecycle);
    if (next) {
      alert.lifecycle = transitionLifecycle(alert.lifecycle, next);
      if (alert.lifecycle === "ACKNOWLEDGED") {
        alert.status = "LIEN_MARKED";
      }
    }
    return alert;
  }

  listAlerts(): ReceivedAlert[] {
    return Array.from(this.alerts.values());
  }

  getAlert(caseId: string): ReceivedAlert | null {
    return this.alerts.get(caseId) || null;
  }

  getAlertByIncidentId(incidentId: string): ReceivedAlert | null {
    return Array.from(this.alerts.values()).find((a) => a.incidentId === incidentId) || null;
  }

  destroy(): void {
    if (this.unsubscribeAccepted) this.unsubscribeAccepted();
    if (this.unsubscribeService) this.unsubscribeService();
  }

  clear(): void {
    this.alerts.clear();
    this.lastPolledTimestamp = undefined;
    this.autoAckInFlight.clear();
  }
}

export const portalBResponseService = new PortalBResponseService();
