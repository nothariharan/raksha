/**
 * Event Contract for Raksha & CAP
 */

export type CAPEventType =
  | "incident.created"
  | "incident.ready"
  | "incident.submitted"
  | "incident.accepted"
  | "service.accepted"
  | "response.acknowledged"
  | "evidence.sealed"
  | "case.updated"
  | "case.followed_up";

export interface CAPEvent<T = unknown> {
  id: string; // e.g. "EVT-000001"
  type: CAPEventType | string;
  caseId: string;
  incidentId?: string;
  source: string;
  timestamp: string;
  payload: T;
}

export interface IncidentCreatedEventPayload {
  incidentId: string;
  source: string;
  state: string;
}

export interface IncidentReadyEventPayload {
  incidentId: string;
  transactionAmount?: number;
  transactionId?: string;
}

export interface IncidentSubmittedEventPayload {
  incidentId: string;
  caseId: string;
  targetService: string;
}

export interface IncidentAcceptedEventPayload {
  incidentId: string;
  caseId: string;
  externalReference: string;
  targetPortal: string;
  status?: string;
  /** Snapshot of the incident at handoff time (for Portal A ingest without re-calling CAP). */
  incident?: unknown;
  /** Visible simulation boundary for demos/audits. */
  simulationBoundary?: string;
}

export interface ServiceAcceptedEventPayload {
  incidentId: string;
  caseId: string;
  portalCaseId: string;
  externalReference: string;
  portal: "portal-a";
  lifecycle: string;
  simulationBoundary?: string;
}

export interface ResponseAcknowledgedEventPayload {
  incidentId: string;
  caseId: string;
  responderInstitution: string;
  actionTaken: string;
}

export interface CaseFollowedUpEventPayload {
  incidentId: string;
  caseId: string;
  externalReference?: string;
  authorizedByCitizen: true;
  note?: string;
  simulationBoundary?: string;
}
