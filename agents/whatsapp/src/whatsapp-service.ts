/**
 * WhatsApp Conversational Service for Raksha
 * Translates WhatsApp input events into Core /v1/process and CAP submissions.
 */

import {
  CAPActionResponse,
  FraudIncident,
  NormalizedInputEvent,
  ProcessResponse,
} from "@raksha/schemas";
import { processService, incidentService } from "@raksha/core";
import { normalizeMobile } from "@raksha/shared";
import { actionRouter } from "@raksha/cap";
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
    const senderPhone = normalizeMobile(inputEvent.senderPhone || "+919876543210");
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

      // Handle direct STATUS / CASE query
      if (/^\s*(status|check status|case|track)\s*$/i.test(content)) {
        // Prefer session-cached incidentId; fall back to Core mobile lookup
        let lookupId = activeIncidentId;
        if (!lookupId) {
          const normPhone = normalizeMobile(senderPhone);
          // Prefer open case; fall back to latest (covers SUBMITTED / ACKNOWLEDGED after CAP)
          const openInc = await incidentService.findOpenByMobile(normPhone);
          const latest = openInc || (await incidentService.findLatestByMobile(normPhone));
          lookupId = latest?.id ?? null;
        }
        if (lookupId) {
          const existingInc = await this.getIncidentStatus(lookupId);
          if (existingInc) {
            const amt = (existingInc.transaction?.amount || 0).toLocaleString();
            const channel = existingInc.transaction?.channel || "UPI";
            const bank = existingInc.transaction?.debitInstitution || "State Bank of India";
            const handoffRef = existingInc.handoff?.externalReference;
            const handoffStatus = existingInc.handoff?.status;
            const institutional = handoffRef
              ? `\n• Tracking Ref: *${handoffRef}*\n• Institutional: *${handoffStatus || "SUBMITTED"}*`
              : "";
            const replyText = `🛡️ *Raksha Case Status*\n\nCase ID: *${existingInc.id}*\nStatus: *${existingInc.state}*\n• Amount: *₹${amt}*\n• Channel: *${channel}*\n• Bank: *${bank}*\n• UTR: *${existingInc.transaction?.transactionId || "Verified"}*${institutional}\n\nYour emergency fraud report is active in the Civic Action Protocol.\n_SIMULATED DEMONSTRATION — 1930 / bank systems are simulated._`;
            return {
              success: true,
              replyText,
              incidentId: lookupId,
              state: existingInc.state,
              fromCache: false,
            };
          }
        }
      }

      // If user provided 12-digit UTR directly in response to question
      if (/^\d{12}$/.test(content.trim()) && session.lastState === "QUESTION_PENDING") {
        userClarificationAnswer = {
          field: "transaction.transactionId",
          answerValue: content.trim(),
        };
      }
    }

    // 4. Process incident via Raksha Core (in-memory or HTTP)
    let processData: ProcessResponse;
    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
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
        if (res.ok) {
          processData = (await res.json()) as ProcessResponse;
        } else {
          const out = await processService.processInput({
            incidentId: activeIncidentId || undefined,
            source: "whatsapp",
            modality,
            content,
            language: session.language,
            reporter: { mobile: senderPhone },
            userClarificationAnswer,
          });
          processData = {
            incidentId: out.incidentId,
            state: out.state,
            nextAction: out.nextAction,
            incident: out.incident,
          };
        }
      } else {
        const out = await processService.processInput({
          incidentId: activeIncidentId || undefined,
          source: "whatsapp",
          modality,
          content,
          language: session.language,
          reporter: { mobile: senderPhone },
          userClarificationAnswer,
        });
        processData = {
          incidentId: out.incidentId,
          state: out.state,
          nextAction: out.nextAction,
          incident: out.incident,
        };
      }
    } catch {
      const out = await processService.processInput({
        incidentId: activeIncidentId || undefined,
        source: "whatsapp",
        modality,
        content,
        language: session.language,
        reporter: { mobile: senderPhone },
        userClarificationAnswer,
      });
      processData = {
        incidentId: out.incidentId,
        state: out.state,
        nextAction: out.nextAction,
        incident: out.incident,
      };
    }

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
      const amt = incident.transaction?.amount
        ? `₹${Number(incident.transaction.amount).toLocaleString()}`
        : "—";
      replyText =
        `✅ *Payment Identified*\n\n` +
        `Please confirm these details are correct:\n` +
        `• Amount: *${amt}*\n` +
        `• Mode: *${incident.transaction?.channel || "—"}*\n` +
        `• Bank: *${incident.transaction?.debitInstitution || "—"}*\n` +
        `• UTR: *${incident.transaction?.transactionId || "—"}*\n` +
        (incident.narrative?.text
          ? `• What happened: ${String(incident.narrative.text).slice(0, 160)}\n`
          : "") +
        `\nReply *YES* to dispatch the emergency freeze to 1930 and the bank.`;
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
    let incident: FraudIncident | null = null;
    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
        const incRes = await fetch(`${this.coreBaseUrl}/v1/incidents/${incidentId}`);
        if (incRes.ok) {
          const raw = (await incRes.json()) as any;
          incident = (raw.incident || raw) as FraudIncident;
        }
      }
    } catch {}

    if (!incident) {
      incident = (await incidentService.getIncident(incidentId)) as FraudIncident | null;
    }
    if (!incident) throw new Error(`Failed to fetch incident ${incidentId}`);

    const idempotencyKey = `whatsapp-cap-${incidentId}`;
    let capData: CAPActionResponse;

    try {
      if (this.capBaseUrl && !this.capBaseUrl.includes("localhost:3002")) {
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
        if (capRes.ok) {
          capData = (await capRes.json()) as CAPActionResponse;
        } else {
          capData = await actionRouter.executeAction("report_financial_fraud", incident, idempotencyKey);
        }
      } else {
        capData = await actionRouter.executeAction("report_financial_fraud", incident, idempotencyKey);
      }
    } catch {
      capData = await actionRouter.executeAction("report_financial_fraud", incident, idempotencyKey);
    }

    const refNumber = capData.externalReference || `1930-SYN-${capData.caseId}`;

    this.store.bindIncident(senderPhone, incidentId, "SUBMITTED");

    const portalA = process.env.PORTAL_A_BASE_URL || "http://localhost:3003";
    const portalB = process.env.PORTAL_B_BASE_URL || "http://localhost:3004";
    const bank = incident.transaction?.debitInstitution || "your bank";

    const replyText =
      `🛡️ *Raksha Emergency Report Accepted*\n\n` +
      `Tracking Reference: *${refNumber}*\n` +
      `Incident ID: *${incidentId}*\n\n` +
      `• Amount: *₹${incident.transaction?.amount ? Number(incident.transaction.amount).toLocaleString() : "—"}*\n` +
      `• Mode: *${incident.transaction?.channel || "—"}*\n` +
      `• Bank: *${bank}*\n` +
      `• UTR: *${incident.transaction?.transactionId || "—"}*\n\n` +
      `Your emergency fraud packet has been handed over for simulated 1930 / bank response.\n\n` +
      `Open desks (simulated):\n` +
      `• 1930 cyber cell: ${portalA}\n` +
      `• ${bank} freeze desk: ${portalB}\n\n` +
      `Nothing else you need to do here.\n` +
      `Reply *STATUS* anytime for an update.`;

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

  async notifyCitizenIncidentAccepted(params: {
    mobile: string;
    incidentId: string;
    referenceNumber: string;
    amount?: number;
    channel?: string;
    bank?: string;
    utr?: string;
  }): Promise<{ sent: boolean; message: string }> {
    const cleanPhone = params.mobile.replace(/whatsapp:/i, "").trim();
    const amt = (params.amount || 5000).toLocaleString();
    const channel = params.channel || "UPI";
    const bank = params.bank || "State Bank of India";
    const utr = params.utr || "Verified";

    const portalA = process.env.PORTAL_A_BASE_URL || "http://localhost:3003";
    const portalB = process.env.PORTAL_B_BASE_URL || "http://localhost:3004";

    const replyText =
      `🛡️ *Raksha Emergency Freeze Confirmation*\n\n` +
      `Dear Citizen,\nYour Raksha emergency report has been submitted to the simulated 1930 / bank response layer.\n\n` +
      `• Tracking Reference: *${params.referenceNumber}*\n` +
      `• Case ID: *${params.incidentId}*\n` +
      `• Amount: *₹${amt}*\n` +
      `• Channel: *${channel}*\n` +
      `• Bank: *${bank}*\n` +
      `• UTR: *${utr}*\n` +
      `• Status: *ACCEPTED — SIMULATED RESPONSE*\n\n` +
      `Open desks (simulated):\n` +
      `• 1930 cyber cell: ${portalA}\n` +
      `• ${bank} freeze desk: ${portalB}\n\n` +
      `Nothing else you need to do here.\n\n` +
      `You can check real-time status anytime by replying *STATUS* to this WhatsApp number.`;

    this.store.bindIncident(cleanPhone, params.incidentId, "SUBMITTED");
    this.store.cacheReply(`notif-${Date.now()}`, {
      messageId: `notif-${Date.now()}`,
      replyText,
      incidentId: params.incidentId,
      state: "SUBMITTED",
      processedAt: new Date().toISOString(),
    });

    // If Twilio credentials exist and outbound is enabled, send via Twilio WhatsApp API
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
      try {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
        const fromNumber = process.env.TWILIO_FROM_NUMBER.startsWith("whatsapp:")
          ? process.env.TWILIO_FROM_NUMBER
          : `whatsapp:${process.env.TWILIO_FROM_NUMBER}`;
        const toNumber = cleanPhone.startsWith("whatsapp:") ? cleanPhone : `whatsapp:${cleanPhone}`;

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: toNumber,
            Body: replyText,
          }).toString(),
        });
      } catch (twilioErr) {
        // Fallback gracefully without breaking local flow
      }
    }

    return { sent: true, message: replyText };
  }

  async getIncidentStatus(incidentId: string): Promise<FraudIncident | null> {
    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
        const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${incidentId}`);
        if (res.ok) {
          return (await res.json()) as FraudIncident;
        }
      }
    } catch {}

    const inc = await incidentService.getIncident(incidentId);
    return inc || null;
  }
}

export const defaultWhatsAppService = new WhatsAppService();
