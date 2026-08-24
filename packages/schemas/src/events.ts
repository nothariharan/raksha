/**
 * Event Contract for Raksha & CAP
 */

export type CAPEventType =
  | "incident.created"
  | "incident.ready"
  | "incident.submitted"
  | "incident.accepted"
  | "response.acknowledged"
  | "evidence.sealed"
  | "case.updated";

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
}

export interface ResponseAcknowledgedEventPayload {
  incidentId: string;
  caseId: string;
  responderInstitution: string;
  actionTaken: string;
}
