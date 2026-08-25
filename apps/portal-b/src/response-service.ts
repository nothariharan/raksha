/**
 * Portal B — Financial Institution Response Console Service
 * Subscribes to incident.accepted and acknowledges freeze/lien actions via CAP.
 * Supports both event bus pub/sub and HTTP event polling.
 */

import { CAPActionResponse, CAPEvent, IncidentAcceptedEventPayload } from "@raksha/schemas";
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
}

export class PortalBResponseService {
  private capClient: ICAPClient;
  private alerts: Map<string, ReceivedAlert> = new Map();
  private unsubscribe?: () => void;
  private lastPolledTimestamp?: string;

  constructor(capClient?: ICAPClient) {
    this.capClient =
      capClient ||
      createCAPClient({
        mode: process.env.CAP_MODE === "http" ? "http" : "in-memory",
        baseUrl: process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002",
      });

    this.initSubscription();
  }

  private initSubscription(): void {
    this.unsubscribe = globalEventBus.subscribe<IncidentAcceptedEventPayload>(
      "incident.accepted",
      (event: CAPEvent<IncidentAcceptedEventPayload>) => {
        const payload = event.payload;
        this.alerts.set(event.caseId, {
          caseId: event.caseId,
          incidentId: payload.incidentId,
          externalReference: payload.externalReference,
          receivedAt: event.timestamp,
          status: "PENDING_REVIEW",
          lifecycle: "NEW",
        });
      }
    );
  }

  async pollEventsFromHttp(): Promise<ReceivedAlert[]> {
    const baseUrl = process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
    const sinceParam = this.lastPolledTimestamp ? `&since=${encodeURIComponent(this.lastPolledTimestamp)}` : "";
    try {
      const res = await fetch(`${baseUrl}/cap/events?type=incident.accepted${sinceParam}`);
      if (!res.ok) return this.listAlerts();
      const data = (await res.json()) as { events: Array<CAPEvent<IncidentAcceptedEventPayload>> };
      for (const ev of data.events || []) {
        this.alerts.set(ev.caseId, {
          caseId: ev.caseId,
          incidentId: ev.payload.incidentId,
          externalReference: ev.payload.externalReference,
          receivedAt: ev.timestamp,
          status: "PENDING_REVIEW",
          lifecycle: "NEW",
        });
        this.lastPolledTimestamp = ev.timestamp;
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

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  clear(): void {
    this.alerts.clear();
    this.lastPolledTimestamp = undefined;
  }
}

export const portalBResponseService = new PortalBResponseService();
