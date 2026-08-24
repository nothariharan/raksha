/**
 * Civic Action Protocol (CAP) Schemas & Interfaces
 * Governs machine-action interoperability between Core, Portals, and AI Agents.
 */

import { FraudIncident } from "./incident.js";

export type CAPActionName =
  | "report_financial_fraud"
  | "attach_evidence"
  | "validate_action"
  | "execute_action"
  | "get_case"
  | "get_case_events"
  | "emit_event"
  | "acknowledge_response"
  | "update_response";

export type CAPCaseStatus =
  | "PENDING"
  | "ACCEPTED"
  | "UNDER_REVIEW"
  | "ACTION_TAKEN"
  | "ACKNOWLEDGED"
  | "REJECTED";

export interface CAPCase {
  id: string; // e.g. "CAP-000001"
  incidentId: string; // e.g. "RKS-000001"
  status: CAPCaseStatus;
  externalReference?: string; // e.g. "1930-SYN-98213"
  targetService: string; // e.g. "portal-a" | "portal-b" | "i4c-mock"
  action: CAPActionName;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface CAPActionRequest<T = unknown> {
  action: CAPActionName;
  incidentId?: string;
  idempotencyKey?: string;
  payload: T;
}

export interface CAPActionResponse<T = unknown> {
  success: boolean;
  status: CAPCaseStatus;
  caseId: string;
  externalReference?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface CAPCapability {
  name: CAPActionName;
  description: string;
  version: string;
  requiredFields: string[];
  targetPortal: "portal-a" | "portal-b" | "core";
}

export interface ReportFinancialFraudPayload {
  incident: FraudIncident;
  idempotencyKey?: string;
}

export interface AcknowledgeResponsePayload {
  caseId: string;
  incidentId: string;
  responderInstitution: string;
  actionTaken: "LIEN_MARKED" | "ACCOUNT_FROZEN" | "TRANSACTION_TRACED" | "FLAGGED_FOR_REVIEW";
  operatorNotes?: string;
}
