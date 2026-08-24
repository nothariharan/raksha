/**
 * Evidence Reference & Capsule Schemas for Raksha
 */

export type EvidenceType =
  | "TRANSACTION_SCREENSHOT"
  | "VOICE_STATEMENT"
  | "SMS_TEXT"
  | "BANK_STATEMENT"
  | "DOCUMENT";

export interface EvidenceReference {
  id: string; // e.g. "EV-001"
  incidentId: string;
  type: EvidenceType;
  uri: string;
  sha256: string;
  mimeType?: string;
  capturedAt: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceCapsule {
  incidentId: string;
  protocolVersion: string;
  sealedAt: string;
  items: EvidenceReference[];
  hashDigest: string; // Aggregate SHA-256 over all evidence records
}

export interface CreateEvidenceInput {
  incidentId: string;
  type: EvidenceType;
  uri: string;
  sha256?: string;
  rawContent?: string | Buffer;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}
