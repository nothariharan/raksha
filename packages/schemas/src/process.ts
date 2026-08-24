/**
 * Process API & Frontend Contract for Raksha
 * Shared response and request schemas consumed by Web, WhatsApp, Phone, and MCP interfaces.
 */

import { FraudIncident, IncidentState, InputSource } from "./incident.js";

export type NextActionType =
  | "NONE"
  | "ASK_USER"
  | "CONFIRM"
  | "CONFIRM_CONFLICT"
  | "UPLOAD_EVIDENCE"
  | "SUBMIT"
  | "READY_FOR_HANDOFF";

export interface NextAction {
  type: NextActionType;
  field?: string;
  conflictField?: string;
  prompt?: string;
  localizedPrompts?: Record<string, string>;
  options?: Array<{ label: string; value: unknown }>;
}

export type NormalizedInputEvent =
  | {
      type: "TEXT";
      source: InputSource;
      text: string;
      language?: string;
      messageId?: string;
      senderPhone?: string;
    }
  | {
      type: "IMAGE";
      source: InputSource;
      mediaUrl: string;
      ocrText?: string;
      language?: string;
      messageId?: string;
      senderPhone?: string;
    }
  | {
      type: "VOICE";
      source: InputSource;
      mediaUrl: string;
      audioTranscript?: string;
      language?: string;
      messageId?: string;
      senderPhone?: string;
    }
  | {
      type: "CONFIRMATION";
      source: InputSource;
      field?: string;
      value: string | number | boolean;
      language?: string;
      messageId?: string;
      senderPhone?: string;
    };

export interface ProcessRequest {
  incidentId?: string;
  source: InputSource;
  modality: "text" | "image" | "voice" | "document" | "sms";
  content: string;
  language?: string;
  reporter?: {
    mobile?: string;
    name?: string;
  };
  userClarificationAnswer?: {
    field: string;
    answerValue: unknown;
  };
  inputEvent?: NormalizedInputEvent;
}

export interface ProcessResponse {
  incidentId: string;
  state: IncidentState;
  nextAction: NextAction;
  incident: FraudIncident;
}
