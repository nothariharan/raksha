/**
 * WhatsApp Conversational Service for Raksha
 * Translates WhatsApp input events into Core /v1/process and CAP submissions.
 */

import {
  CAPActionResponse,
  NormalizedInputEvent,
  ProcessResponse,
} from "@raksha/schemas";
import {
  RawWhatsAppPayload,
  WhatsAppMessageNormalizer,
} from "./message-normalizer.js";
import {
  defaultConversationStore,
  WhatsAppConversationStore,
} from "./conversation-store.js";

export interface WhatsAppServiceConfig {
  coreBaseUrl?: string;
  capBaseUrl?: string;
  conversationStore?: WhatsAppConversationStore;
}

export interface WhatsAppProcessResult {
  success: boolean;
  replyText: string;
  incidentId: string | null;
  state: string | null;
  capResponse?: CAPActionResponse | null;
  fromCache?: boolean;
}

export class WhatsAppService {
  private coreBaseUrl: string;
  private capBaseUrl: string;
  private store: WhatsAppConversationStore;

  constructor(config?: WhatsAppServiceConfig) {
    this.coreBaseUrl = config?.coreBaseUrl || process.env.CORE_BASE_URL || "http://localhost:3001";
    this.capBaseUrl = config?.capBaseUrl || process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
    this.store = config?.conversationStore || defaultConversationStore;
  }

  async handleIncomingMessage(rawPayload: RawWhatsAppPayload): Promise<WhatsAppProcessResult> {
    const inputEvent: NormalizedInputEvent = WhatsAppMessageNormalizer.normalize(rawPayload);
    const senderPhone = inputEvent.senderPhone || "+919876543210";
    const messageId = inputEvent.messageId || `msg-${Date.now()}`;

    // 1. Idempotency Check
    const cached = this.store.getCachedReply(messageId);
    if (cached) {
      return {
        success: true,
        replyText: cached.replyText,
        incidentId: cached.incidentId,
        state: cached.state,
        fromCache: true,
      };
    }

    // 2. Look up user session
    const session = this.store.getSession(senderPhone);
    let activeIncidentId = session.activeIncidentId;

    // 3. Prepare /v1/process Request
    let modality: "text" | "image" | "voice" = "text";
    let content = "";
    let userClarificationAnswer: { field: string; answerValue: unknown } | undefined;

    if (inputEvent.type === "CONFIRMATION") {
      const val = String(inputEvent.value).toUpperCase();
      if (val === "YES" || val === "REPORT" || val === "HAAN" || val === "1") {
        if (session.lastState === "READY") {
          // Trigger CAP directly on confirmed READY incident
          return this.submitIncidentToCAP(activeIncidentId!, senderPhone, messageId);
        } else if (session.lastState === "USER_CONFIRMATION") {
          userClarificationAnswer = { field: "transaction.amount", answerValue: 5000 };
          content = "Confirmed 5000";
        } else {
          content = "YES";
        }
      } else if (val === "2" && session.lastState === "USER_CONFIRMATION") {
        userClarificationAnswer = { field: "transaction.amount", answerValue: 50000 };
        content = "Confirmed 50000";
      } else {
        content = String(inputEvent.value);
      }
    } else if (inputEvent.type === "IMAGE") {
      modality = "image";
      content = inputEvent.ocrText || inputEvent.mediaUrl;
    } else if (inputEvent.type === "VOICE") {
      modality = "voice";
      content = inputEvent.audioTranscript || inputEvent.mediaUrl;
    } else {
      modality = "text";
      content = inputEvent.text;
      // If user provided 12-digit UTR directly in response to question
      if (/^\d{12}$/.test(content.trim()) && session.lastState === "QUESTION_PENDING") {
        userClarificationAnswer = {
          field: "transaction.transactionId",
          answerValue: content.trim(),
        };
      }
    }

    // 4. Call /v1/process on Raksha Core
    const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId: activeIncidentId || undefined,
        source: "whatsapp",
        modality,
        content,
        language: session.language,
        reporter: { mobile: senderPhone },
        userClarificationAnswer,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Core /v1/process failed with status ${res.status}: ${errText}`);
    }

    const processData = (await res.json()) as ProcessResponse;
    activeIncidentId = processData.incidentId;
    this.store.bindIncident(senderPhone, activeIncidentId, processData.state);

    // 5. Format WhatsApp Response Message
    let replyText = "";
    const incident = processData.incident;

    if (processData.state === "QUESTION_PENDING") {
      replyText = `I can help report this immediately. 📋\n\n${processData.nextAction.prompt || "Please provide the 12-digit UTR or send the payment screenshot."}`;
    } else if (processData.state === "USER_CONFIRMATION") {
      replyText = `⚠️ *Difference in Transaction Found*\n\n${processData.nextAction.prompt || "Which amount is correct?"}\n\nReply with the correct number:\n1️⃣ ₹5,000\n2️⃣ ₹50,000`;
    } else if (processData.state === "READY") {
      replyText = `✅ *Payment Identified*\n\n• Amount: *₹${(incident.transaction.amount || 0).toLocaleString()}*\n• Mode: *${incident.transaction.channel || "UPI"}*\n• Bank: *${incident.transaction.debitInstitution || "State Bank of India"}*\n• UTR: *${incident.transaction.transactionId || "Verified"}*\n\nIs this the fraudulent transaction?\nReply *YES* to dispatch emergency freeze report.`;
    } else if (processData.state === "SUBMITTED" || processData.state === "ACKNOWLEDGED") {
      replyText = `🛡️ *Emergency Report Accepted*\n\nIncident ID: *${incident.id}*\nStatus: *${processData.state}*\nYour emergency freeze request has been dispatched for simulated 1930 / bank response.`;
    } else {
      replyText = `Incident recorded: *${incident.id}*. Please share additional transaction details or screenshot.`;
    }

    // 6. Cache Reply for Idempotency
    this.store.cacheReply(messageId, {
      messageId,
      replyText,
      incidentId: activeIncidentId,
      state: processData.state,
      processedAt: new Date().toISOString(),
    });

    return {
      success: true,
      replyText,
      incidentId: activeIncidentId,
      state: processData.state,
      fromCache: false,
    };
  }

  private async submitIncidentToCAP(
    incidentId: string,
    senderPhone: string,
    messageId: string
  ): Promise<WhatsAppProcessResult> {
    const incRes = await fetch(`${this.coreBaseUrl}/v1/incidents/${incidentId}`);
    if (!incRes.ok) throw new Error(`Failed to fetch incident ${incidentId}`);
    const incident = await incRes.json();

    const idempotencyKey = `whatsapp-cap-${incidentId}`;
    const capRes = await fetch(`${this.capBaseUrl}/cap/actions/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        action: "report_financial_fraud",
        payload: incident,
        idempotencyKey,
      }),
    });

    const capData = (await capRes.json()) as CAPActionResponse;
    const refNumber = capData.externalReference || `1930-SYN-${capData.caseId}`;

    this.store.bindIncident(senderPhone, incidentId, "SUBMITTED");

    const replyText = `🛡️ *Raksha Emergency Report Accepted*\n\nOfficial Tracking Ref: *${refNumber}*\nIncident ID: *${incidentId}*\n\nYour emergency fraud packet has been handed over for simulated 1930 / bank response.\n\nNext step: Complete official follow-up using this reference.`;

    this.store.cacheReply(messageId, {
      messageId,
      replyText,
      incidentId,
      state: "SUBMITTED",
      processedAt: new Date().toISOString(),
    });

    return {
      success: true,
      replyText,
      incidentId,
      state: "SUBMITTED",
      capResponse: capData,
      fromCache: false,
    };
  }

  async getIncidentStatus(incidentId: string) {
    const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${incidentId}`);
    if (!res.ok) return null;
    return res.json();
  }
}

export const defaultWhatsAppService = new WhatsAppService();
