/**
 * Multimodal Extraction Contract for Raksha Core
 * Defines candidate structures extracted by text, vision, and voice pipelines.
 */

import { TransactionChannel } from "@raksha/schemas";

export type ModalityType = "text" | "image" | "voice" | "document" | "sms";

export type FraudCategory =
  | "ELECTRICITY_BILL_SCAM"
  | "DIGITAL_ARREST"
  | "UPI_PAYMENT_FRAUD"
  | "TASK_SCAM"
  | "KYC_UPDATE_FRAUD"
  | "LOTTERY_PHISHING"
  | "CUSTOMER_CARE_IMPERSONATION"
  | "OTHER";

export interface ExtractedFraudCandidate {
  incidentType?: string;
  fraudCategory?: FraudCategory;
  narrative?: string;
  amount?: number;
  currency?: string;
  channel?: TransactionChannel;
  application?: string; // e.g. "PhonePe", "Google Pay", "Paytm", "BHIM", "CRED"
  transactionId?: string | null; // 12-digit UTR / RRN
  transactionDatetime?: string | null; // ISO 8601 string
  debitInstitution?: string | null; // e.g. "State Bank of India", "HDFC Bank"
  beneficiaryIdentifier?: string | null; // UPI VPA or account
  beneficiaryInstitution?: string | null; // e.g. "Yes Bank Ltd"
  reporterMobile?: string | null;
  reporterLanguage?: string;
  rawEntities?: Record<string, unknown>;
  confidence: Record<string, number>; // 0.0 to 1.0 per extracted field
  sourceRefs: Record<string, string[]>; // Map field name -> list of source identifiers (e.g. { amount: ["screenshot#1", "voice#1"] })
  extractedAt: string;
}

export interface ExtractionInput {
  modality: ModalityType;
  content: string; // Plain text, audio transcript, OCR text, or base64
  language?: string;
  sourceId?: string; // e.g. "voice#1", "screenshot#1", "text#1"
  metadata?: Record<string, unknown>;
}
