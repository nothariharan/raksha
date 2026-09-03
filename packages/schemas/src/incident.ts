/**
 * Canonical Incident Schemas for Raksha
 * Protocol Version: raksha/0.1
 */

export const PROTOCOL_VERSION = "raksha/0.1";

export type IncidentState =
  | "INTAKE"
  | "EXTRACTING"
  | "VALIDATING"
  | "QUESTION_PENDING"
  | "USER_CONFIRMATION"
  | "READY"
  | "EVIDENCE_SEALED"
  | "PACKET_READY"
  | "HANDOFF_PENDING"
  | "SUBMITTED"
  | "ACKNOWLEDGED"
  | "FOLLOW_UP_REQUIRED"
  | "TRACKING"
  | "REJECTED";

/**
 * States that represent an open, resumable workflow.
 * findOpenByMobile() only returns incidents in these states.
 * SUBMITTED, ACKNOWLEDGED, TRACKING, REJECTED are terminal — a new case starts fresh.
 */
export const OPEN_INCIDENT_STATES: IncidentState[] = [
  "INTAKE",
  "EXTRACTING",
  "VALIDATING",
  "QUESTION_PENDING",
  "USER_CONFIRMATION",
  "READY",
  "EVIDENCE_SEALED",
  "PACKET_READY",
  "HANDOFF_PENDING",
];

export type InputSource = "web" | "whatsapp" | "phone" | "agent" | "mcp";

export type InputEventType =
  | "TEXT"
  | "VOICE"
  | "IMAGE"
  | "DOCUMENT"
  | "USER_CONFIRMATION"
  | "USER_CORRECTION";

export interface InputEvent {
  id: string;
  incidentId: string;
  source: InputSource;
  type: InputEventType;
  payload: {
    text?: string;
    mediaUri?: string;
    mediaType?: string;
    rawInput?: unknown;
    language?: string;
  };
  timestamp: string;
}

export type TransactionChannel =
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "WALLET"
  | "NET_BANKING"
  | "OTHER";

export interface TransactionDetails {
  amount?: number;
  currency?: string;
  transactionId?: string; // 12-digit UTR / RRN or Reference ID
  timestamp?: string; // ISO 8601 string
  debitInstitution?: string; // e.g. "State Bank of India", "HDFC Bank"
  beneficiaryIdentifier?: string; // UPI VPA or account number
  beneficiaryInstitution?: string; // e.g. "Yes Bank Ltd"
  channel?: TransactionChannel;
}

export interface ReporterInfo {
  mobile?: string;
  name?: string;
  preferredLanguage?: string;
  state?: string;
  district?: string;
}

export interface IncidentNarrative {
  text: string;
  source: InputSource;
}

export type ValidationStatus = "PENDING" | "READY" | "INCOMPLETE" | "CONFLICT" | "INVALID";

export interface FieldConflict {
  field: string;
  values: unknown[];
  explanation: string;
}

export interface IncidentValidation {
  status: ValidationStatus;
  missingFields: string[];
  conflicts: FieldConflict[];
  nextQuestion?: string;
  validatedAt?: string;
}

export type HandoffStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "ACKNOWLEDGED";

export interface IncidentHandoff {
  target: string;
  status: HandoffStatus;
  externalReference?: string;
  submittedAt?: string;
  acknowledgedAt?: string;
  nextRequiredAction?: string;
}

export interface FraudIncident {
  id: string;
  protocolVersion: string;
  type: "FINANCIAL_CYBER_FRAUD";
  narrative: IncidentNarrative;
  reporter: ReporterInfo;
  transaction: TransactionDetails;
  evidence: string[]; // List of EvidenceReference IDs
  state: IncidentState;
  validation: IncidentValidation;
  handoff: IncidentHandoff;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentInput {
  source: InputSource;
  narrative: {
    text: string;
  };
  reporter?: Partial<ReporterInfo>;
  transaction?: Partial<TransactionDetails>;
}
