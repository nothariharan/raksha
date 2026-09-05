/**
 * WhatsApp Conversational Service for Raksha
 * Bidirectional citizen edge: inbound turn → Core → outbound WhatsApp reply.
 * Core owns incident identity and workflow state.
 */

import {
  CAPActionResponse,
  FraudIncident,
  NextAction,
  NormalizedInputEvent,
  ProcessResponse,
} from "@raksha/schemas";
import { ProcessInput, ProcessOutput, processService, incidentService } from "@raksha/core";
import { normalizeMobile } from "@raksha/shared";
import { actionRouter } from "@raksha/cap";
import { SupportedLanguage } from "@raksha/i18n";
import {
  RawWhatsAppPayload,
  WhatsAppMessageNormalizer,
} from "./message-normalizer.js";
import {
  ConflictOption,
  defaultConversationStore,
  PendingTurn,
  WhatsAppConversationStore,
  WhatsAppSession,
} from "./conversation-store.js";
import { parseLanguageChoice, normalizeSupportedLanguage } from "./language.js";
import {
  formatAccepted,
  formatAskNarrative,
  formatConflict,
  formatLanguagePicker,
  formatNoCase,
  formatNotifyAccepted,
  formatQuestion,
  formatReady,
  formatRecorded,
  formatStatus,
  optionsFromNextAction,
} from "./replies.js";
import { sendTwilioWhatsApp, TwilioOutboundResult } from "./twilio.js";
import { speakRakshaReply } from "./gemini-brain.js";

export interface WhatsAppIncidentLookup {
  findOpenByMobile(mobile: string): Promise<FraudIncident | null>;
  findLatestByMobile(mobile: string): Promise<FraudIncident | null>;
  getIncident(id: string): Promise<FraudIncident | null>;
}

export interface WhatsAppServiceConfig {
  coreBaseUrl?: string;
  capBaseUrl?: string;
  conversationStore?: WhatsAppConversationStore;
  incidentLookup?: WhatsAppIncidentLookup;
  processInput?: (input: ProcessInput) => Promise<ProcessOutput>;
  executeCap?: (incident: FraudIncident, idempotencyKey: string) => Promise<CAPActionResponse>;
  sendOutbound?: (to: string, body: string) => Promise<TwilioOutboundResult>;
}

export interface WhatsAppProcessResult {
  success: boolean;
  replyText: string;
  incidentId: string | null;
  state: string | null;
  capResponse?: CAPActionResponse | null;
  fromCache?: boolean;
  outbound?: TwilioOutboundResult;
}

function usesRemoteCore(baseUrl: string): boolean {
  return Boolean(baseUrl) && !baseUrl.includes("localhost:3001");
}

function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isStatusCommand(text: string): boolean {
  return /^\s*(status|check status|case|track)\s*$/i.test(text);
}

function isYes(value: string): boolean {
  return /^(yes|report|confirm|haan|ha|हाँ|சரி)$/i.test(value.trim());
}

export class WhatsAppService {
  private coreBaseUrl: string;
  private capBaseUrl: string;
  private store: WhatsAppConversationStore;
  private incidentLookup?: WhatsAppIncidentLookup;
  private processInputFn?: (input: ProcessInput) => Promise<ProcessOutput>;
  private executeCapFn?: (incident: FraudIncident, idempotencyKey: string) => Promise<CAPActionResponse>;
  private sendOutboundFn: (to: string, body: string) => Promise<TwilioOutboundResult>;

  constructor(config?: WhatsAppServiceConfig) {
    this.coreBaseUrl = config?.coreBaseUrl || process.env.CORE_BASE_URL || "http://localhost:3001";
    this.capBaseUrl = config?.capBaseUrl || process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
    this.store = config?.conversationStore || defaultConversationStore;
    this.incidentLookup = config?.incidentLookup;
    this.processInputFn = config?.processInput;
    this.executeCapFn = config?.executeCap;
    this.sendOutboundFn = config?.sendOutbound || sendTwilioWhatsApp;
  }

  async handleIncomingMessage(rawPayload: RawWhatsAppPayload): Promise<WhatsAppProcessResult> {
    const inputEvent: NormalizedInputEvent = WhatsAppMessageNormalizer.normalize(rawPayload);
    const senderPhone = normalizeMobile(inputEvent.senderPhone || "+919876543210");
    const messageId = inputEvent.messageId || `msg-${Date.now()}`;

    const cached = this.store.getCachedReply(messageId);
    if (cached) {
      return {
        success: true,
        replyText: cached.replyText,
        incidentId: cached.incidentId,
        state: cached.state,
        fromCache: true,
        outbound: { attempted: false, sent: false, skipped: true },
      };
    }

    const session = await this.hydrateSession(senderPhone);
    if (inputEvent.language) {
      const fromPayload = normalizeSupportedLanguage(inputEvent.language);
      if (fromPayload) {
        this.store.setSession(senderPhone, { language: fromPayload, languageConfirmed: true });
      }
    }

    const result = await this.routeTurn(session, inputEvent, senderPhone, messageId);
    const citizenMessage =
      inputEvent.type === "TEXT"
        ? inputEvent.text
        : inputEvent.type === "CONFIRMATION"
          ? String(inputEvent.value)
          : inputEvent.type === "IMAGE"
            ? "sent a screenshot"
            : inputEvent.type === "VOICE"
              ? "sent a voice note"
              : "";
    const replyText = await speakRakshaReply({
      citizenMessage,
      language: this.store.getSession(senderPhone).language,
      draft: result.replyText,
      incidentId: result.incidentId,
      state: result.state,
    });
    if (replyText !== result.replyText) {
      this.store.cacheReply(messageId, {
        messageId,
        replyText,
        incidentId: result.incidentId,
        state: result.state as never,
        processedAt: new Date().toISOString(),
      });
    }
    const outbound = await this.dispatchOutbound(senderPhone, replyText);
    return { ...result, replyText, outbound };
  }

  private async routeTurn(
    session: WhatsAppSession,
    inputEvent: NormalizedInputEvent,
    senderPhone: string,
    messageId: string
  ): Promise<WhatsAppProcessResult> {
    const live = this.store.getSession(senderPhone);
    const textValue =
      inputEvent.type === "TEXT"
        ? inputEvent.text
        : inputEvent.type === "CONFIRMATION"
          ? String(inputEvent.value)
          : "";

    if (inputEvent.type === "TEXT" && isStatusCommand(textValue)) {
      return this.replyStatus(senderPhone, messageId);
    }

    if (this.shouldAskLanguage(live, inputEvent, textValue)) {
      const choice = parseLanguageChoice(textValue);
      if (choice) {
        this.store.setSession(senderPhone, {
          language: choice,
          languageConfirmed: true,
        });
        const pending = live.pendingTurn;
        this.store.setSession(senderPhone, { pendingTurn: null });
        if (pending) {
          return this.processCitizenContent(senderPhone, messageId, pending.modality, pending.content);
        }
        return this.finish(senderPhone, messageId, formatAskNarrative(choice), live.activeIncidentId, live.lastState);
      }

      if (this.looksLikeHeldStory(inputEvent, textValue)) {
        this.store.setSession(senderPhone, { pendingTurn: this.toPendingTurn(inputEvent, textValue) });
      }
      return this.finish(senderPhone, messageId, formatLanguagePicker(), live.activeIncidentId, live.lastState);
    }

    const confirmationValue = inputEvent.type === "CONFIRMATION" ? String(inputEvent.value) : textValue;

    if (live.lastState === "READY" && (inputEvent.type === "CONFIRMATION" || isYes(textValue))) {
      if (live.activeIncidentId && (isYes(textValue) || confirmationValue.toUpperCase() === "1")) {
        return this.submitIncidentToCAP(live.activeIncidentId, senderPhone, messageId);
      }
    }

    let modality: "text" | "image" | "voice" = "text";
    let content = "";
    let userClarificationAnswer: { field: string; answerValue: unknown } | undefined;

    if (inputEvent.type === "CONFIRMATION" || live.lastState === "USER_CONFIRMATION") {
      const picked = this.pickConflictAnswer(textValue || confirmationValue, live);
      if (picked !== undefined) {
        userClarificationAnswer = {
          field: live.lastConflictField || "transaction.amount",
          answerValue: picked,
        };
        content = `Confirmed ${picked}`;
      } else if (live.lastState === "USER_CONFIRMATION") {
        return this.finish(
          senderPhone,
          messageId,
          formatConflict(live.language, undefined, live.lastConflictOptions),
          live.activeIncidentId,
          live.lastState
        );
      } else {
        content = confirmationValue || textValue;
      }
    } else if (inputEvent.type === "IMAGE") {
      modality = "image";
      content = inputEvent.ocrText || inputEvent.mediaUrl;
    } else if (inputEvent.type === "VOICE") {
      modality = "voice";
      content = inputEvent.audioTranscript || inputEvent.mediaUrl;
    } else {
      content = textValue;
      if (/^\d{12}$/.test(content.trim()) && live.lastState === "QUESTION_PENDING") {
        userClarificationAnswer = {
          field: live.lastPendingField || "transaction.transactionId",
          answerValue: content.trim(),
        };
      } else if (live.lastState === "QUESTION_PENDING" && live.lastPendingField === "transaction.amount") {
        const amount = parseAmount(content);
        if (amount !== null) {
          userClarificationAnswer = { field: "transaction.amount", answerValue: amount };
        }
      }
    }

    return this.processCitizenContent(senderPhone, messageId, modality, content, userClarificationAnswer);
  }

  private shouldAskLanguage(
    session: WhatsAppSession,
    inputEvent: NormalizedInputEvent,
    textValue: string
  ): boolean {
    if (session.languageConfirmed) return false;
    if (session.lastState === "READY" && isYes(textValue)) return false;
    if (inputEvent.language && normalizeSupportedLanguage(inputEvent.language)) return false;
    return true;
  }

  private looksLikeHeldStory(inputEvent: NormalizedInputEvent, textValue: string): boolean {
    if (inputEvent.type === "IMAGE" || inputEvent.type === "VOICE") return true;
    if (parseLanguageChoice(textValue)) return false;
    return textValue.trim().length >= 12;
  }

  private toPendingTurn(inputEvent: NormalizedInputEvent, textValue: string): PendingTurn {
    if (inputEvent.type === "IMAGE") {
      return { modality: "image", content: inputEvent.ocrText || inputEvent.mediaUrl };
    }
    if (inputEvent.type === "VOICE") {
      return { modality: "voice", content: inputEvent.audioTranscript || inputEvent.mediaUrl };
    }
    return { modality: "text", content: textValue };
  }

  private pickConflictAnswer(raw: string, session: WhatsAppSession): unknown | undefined {
    const options = session.lastConflictOptions || [];
    const compact = raw.trim();
    const index = /^(1|2|3|4|5|6|7)$/.test(compact) ? Number(compact) - 1 : -1;
    if (index >= 0 && options[index]) return options[index].value;

    const amount = parseAmount(compact);
    if (amount !== null) {
      const match = options.find((opt) => Number(opt.value) === amount);
      return match ? match.value : amount;
    }
    return undefined;
  }

  private async processCitizenContent(
    senderPhone: string,
    messageId: string,
    modality: "text" | "image" | "voice",
    content: string,
    userClarificationAnswer?: { field: string; answerValue: unknown }
  ): Promise<WhatsAppProcessResult> {
    const session = this.store.getSession(senderPhone);
    const processData = await this.callProcess({
      incidentId: session.activeIncidentId || undefined,
      source: "whatsapp",
      modality,
      content,
      language: session.language,
      reporter: { mobile: senderPhone },
      userClarificationAnswer,
    });

    this.store.bindIncident(senderPhone, processData.incidentId, processData.state);
    const options = optionsFromNextAction(processData.nextAction);
    const field = processData.nextAction?.field || processData.nextAction?.conflictField || null;
    this.store.setSession(senderPhone, {
      lastConflictOptions: options,
      lastConflictField: field,
      lastPendingField: processData.nextAction?.field || null,
      languageConfirmed: true,
    });

    const lang = session.language;
    let replyText = "";
    const incident = processData.incident;

    if (processData.state === "QUESTION_PENDING") {
      replyText = formatQuestion(lang, processData.nextAction.prompt);
    } else if (processData.state === "USER_CONFIRMATION") {
      replyText = formatConflict(lang, processData.nextAction.prompt, options);
    } else if (processData.state === "READY") {
      replyText = formatReady(lang, incident);
    } else if (processData.state === "SUBMITTED" || processData.state === "ACKNOWLEDGED") {
      replyText = formatAccepted(
        lang,
        incident,
        incident.handoff?.externalReference || incident.id,
        process.env.PORTAL_A_BASE_URL || "http://localhost:3003",
        process.env.PORTAL_B_BASE_URL || "http://localhost:3004"
      );
    } else {
      replyText = formatRecorded(incident.id, processData.nextAction.prompt);
    }

    return this.finish(senderPhone, messageId, replyText, processData.incidentId, processData.state);
  }

  private async replyStatus(senderPhone: string, messageId: string): Promise<WhatsAppProcessResult> {
    const session = this.store.getSession(senderPhone);
    let lookupId = session.activeIncidentId;
    if (!lookupId) {
      const latest = (await this.lookupOpen(senderPhone)) || (await this.lookupLatest(senderPhone));
      lookupId = latest?.id ?? null;
      if (latest) this.store.bindIncident(senderPhone, latest.id, latest.state);
    }
    if (!lookupId) {
      return this.finish(senderPhone, messageId, formatNoCase(session.language), null, null);
    }
    const existingInc = await this.getIncidentStatus(lookupId);
    if (!existingInc) {
      return this.finish(senderPhone, messageId, formatNoCase(session.language), lookupId, session.lastState);
    }
    return this.finish(
      senderPhone,
      messageId,
      formatStatus(session.language, existingInc),
      lookupId,
      existingInc.state
    );
  }

  private async hydrateSession(phoneNumber: string): Promise<WhatsAppSession> {
    const session = this.store.getSession(phoneNumber);
    if (session.hydratedFromCore) return session;
    if (session.activeIncidentId) {
      return this.store.setSession(phoneNumber, { hydratedFromCore: true });
    }

    const open = await this.lookupOpen(phoneNumber);
    const latest = open || (await this.lookupLatest(phoneNumber));
    if (latest) {
      this.store.bindIncident(phoneNumber, latest.id, latest.state);
      const lang = normalizeSupportedLanguage(latest.reporter?.preferredLanguage);
      const conflict = latest.validation?.conflicts?.[0];
      const options: ConflictOption[] = (conflict?.values || []).map((value) => ({
        label: typeof value === "number" ? `₹${Number(value).toLocaleString("en-IN")}` : String(value),
        value,
      }));
      this.store.setSession(phoneNumber, {
        hydratedFromCore: true,
        language: lang || session.language,
        languageConfirmed: Boolean(lang) || Boolean(latest.id),
        lastConflictOptions: options,
        lastConflictField: conflict?.field || null,
      });
    } else {
      this.store.setSession(phoneNumber, { hydratedFromCore: true });
    }
    return this.store.getSession(phoneNumber);
  }

  private async lookupOpen(mobile: string): Promise<FraudIncident | null> {
    if (this.incidentLookup) return this.incidentLookup.findOpenByMobile(mobile);
    if (usesRemoteCore(this.coreBaseUrl)) {
      try {
        const res = await fetch(
          `${this.coreBaseUrl}/v1/incidents/open?mobile=${encodeURIComponent(mobile)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { incident?: FraudIncident | null };
          return data.incident || null;
        }
      } catch {
        /* fall through */
      }
    }
    return incidentService.findOpenByMobile(mobile);
  }

  private async lookupLatest(mobile: string): Promise<FraudIncident | null> {
    if (this.incidentLookup) return this.incidentLookup.findLatestByMobile(mobile);
    if (usesRemoteCore(this.coreBaseUrl)) {
      try {
        const res = await fetch(
          `${this.coreBaseUrl}/v1/incidents/latest?mobile=${encodeURIComponent(mobile)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { incident?: FraudIncident | null };
          return data.incident || null;
        }
      } catch {
        /* fall through */
      }
    }
    return incidentService.findLatestByMobile(mobile);
  }

  private async callProcess(input: ProcessInput): Promise<ProcessResponse> {
    if (this.processInputFn) {
      const out = await this.processInputFn(input);
      return {
        incidentId: out.incidentId,
        state: out.state,
        nextAction: out.nextAction as NextAction,
        incident: out.incident,
      };
    }

    try {
      if (usesRemoteCore(this.coreBaseUrl)) {
        const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.ok) return (await res.json()) as ProcessResponse;
      }
    } catch {
      /* in-process fallback */
    }

    const out = await processService.processInput(input);
    return {
      incidentId: out.incidentId,
      state: out.state,
      nextAction: out.nextAction as NextAction,
      incident: out.incident,
    };
  }

  private async submitIncidentToCAP(
    incidentId: string,
    senderPhone: string,
    messageId: string
  ): Promise<WhatsAppProcessResult> {
    const incident = await this.getIncidentStatus(incidentId);
    if (!incident) throw new Error(`Failed to fetch incident ${incidentId}`);

    const idempotencyKey = `whatsapp-cap-${incidentId}`;
    let capData: CAPActionResponse;

    if (this.executeCapFn) {
      capData = await this.executeCapFn(incident, idempotencyKey);
    } else {
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
    }

    const refNumber = capData.externalReference || `1930-SYN-${capData.caseId}`;
    this.store.bindIncident(senderPhone, incidentId, "SUBMITTED");
    const lang = this.store.getSession(senderPhone).language;
    const replyText = formatAccepted(
      lang,
      incident,
      refNumber,
      process.env.PORTAL_A_BASE_URL || "http://localhost:3003",
      process.env.PORTAL_B_BASE_URL || "http://localhost:3004"
    );

    const finished = this.finish(senderPhone, messageId, replyText, incidentId, "SUBMITTED");
    return { ...finished, capResponse: capData };
  }

  async notifyCitizenIncidentAccepted(params: {
    mobile: string;
    incidentId: string;
    referenceNumber: string;
    amount?: number;
    channel?: string;
    bank?: string;
    utr?: string;
  }): Promise<WhatsAppProcessResult> {
    const cleanPhone = normalizeMobile(params.mobile.replace(/whatsapp:/i, "").trim());
    const session = this.store.getSession(cleanPhone);
    const replyText = formatNotifyAccepted(session.language, {
      incidentId: params.incidentId,
      referenceNumber: params.referenceNumber,
      amount: params.amount,
      channel: params.channel,
      bank: params.bank,
      utr: params.utr,
      portalA: process.env.PORTAL_A_BASE_URL || "http://localhost:3003",
      portalB: process.env.PORTAL_B_BASE_URL || "http://localhost:3004",
    });

    this.store.bindIncident(cleanPhone, params.incidentId, "SUBMITTED");
    const outbound = await this.dispatchOutbound(cleanPhone, replyText);
    const finished = this.finish(
      cleanPhone,
      `notif-${Date.now()}`,
      replyText,
      params.incidentId,
      "SUBMITTED"
    );
    return { ...finished, outbound };
  }

  async getIncidentStatus(incidentId: string): Promise<FraudIncident | null> {
    if (this.incidentLookup) return this.incidentLookup.getIncident(incidentId);
    try {
      if (usesRemoteCore(this.coreBaseUrl)) {
        const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${incidentId}`);
        if (res.ok) return (await res.json()) as FraudIncident;
      }
    } catch {
      /* in-process */
    }
    return (await incidentService.getIncident(incidentId)) || null;
  }

  private finish(
    senderPhone: string,
    messageId: string,
    replyText: string,
    incidentId: string | null,
    state: ProcessResponse["state"] | string | null
  ): WhatsAppProcessResult {
    this.store.cacheReply(messageId, {
      messageId,
      replyText,
      incidentId,
      state: (state as WhatsAppProcessResult["state"]) as never,
      processedAt: new Date().toISOString(),
    });
    return {
      success: true,
      replyText,
      incidentId,
      state,
      fromCache: false,
    };
  }

  private async dispatchOutbound(to: string, body: string): Promise<TwilioOutboundResult> {
    try {
      return await this.sendOutboundFn(to, body);
    } catch (err) {
      return { attempted: true, sent: false, error: (err as Error).message };
    }
  }
}

export const defaultWhatsAppService = new WhatsAppService();
