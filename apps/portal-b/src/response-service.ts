/**
 * Portal B — Financial Institution Response Console Service
 * Subscribes to incident.accepted and acknowledges freeze/lien actions via CAP.
 */

import { CAPActionResponse, CAPEvent, IncidentAcceptedEventPayload } from "@raksha/schemas";
import { createCAPClient, ICAPClient } from "@raksha/cap-sdk";
import { globalEventBus } from "@raksha/shared";

export interface ReceivedAlert {
  caseId: string;
  incidentId: string;
  externalReference: string;
  receivedAt: string;
  status: "PENDING_REVIEW" | "LIEN_MARKED" | "ACCOUNT_FROZEN";
}

export class PortalBResponseService {
  private capClient: ICAPClient;
  private alerts: Map<string, ReceivedAlert> = new Map();
  private unsubscribe?: () => void;

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
        });
      }
    );
  }

  async acknowledgeFreeze(params: {
    caseId: string;
    incidentId: string;
    responderInstitution: string;
    actionTaken: "LIEN_MARKED" | "ACCOUNT_FROZEN" | "TRANSACTION_TRACED" | "FLAGGED_FOR_REVIEW";
    operatorNotes?: string;
  }): Promise<CAPActionResponse> {
    const alert = this.alerts.get(params.caseId);
    if (alert) {
      alert.status = params.actionTaken === "ACCOUNT_FROZEN" ? "ACCOUNT_FROZEN" : "LIEN_MARKED";
    }

    return this.capClient.executeAction("acknowledge_response", params);
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
  }
}

export const portalBResponseService = new PortalBResponseService();
