/**
 * WhatsApp conversation cache.
 * Core remains authoritative for incident state. This store only holds
 * per-process conversation context (language, pending turn, last conflict options).
 */

import { IncidentState } from "@raksha/schemas";
import { SupportedLanguage } from "@raksha/i18n";
import { normalizeMobile } from "@raksha/shared";

export interface ConflictOption {
  label: string;
  value: unknown;
}

export interface PendingTurn {
  modality: "text" | "image" | "voice";
  content: string;
}

export interface WhatsAppSession {
  phoneNumber: string;
  activeIncidentId: string | null;
  language: SupportedLanguage;
  languageConfirmed: boolean;
  lastState: IncidentState | null;
  lastActive: string;
  hydratedFromCore: boolean;
  pendingTurn: PendingTurn | null;
  lastConflictOptions: ConflictOption[];
  lastConflictField: string | null;
  lastPendingField: string | null;
}

export interface CachedMessageReply {
  messageId: string;
  replyText: string;
  incidentId: string | null;
  state: IncidentState | null;
  processedAt: string;
}

function emptySession(phoneNumber: string): WhatsAppSession {
  return {
    phoneNumber,
    activeIncidentId: null,
    language: "en",
    languageConfirmed: false,
    lastState: null,
    lastActive: new Date().toISOString(),
    hydratedFromCore: false,
    pendingTurn: null,
    lastConflictOptions: [],
    lastConflictField: null,
    lastPendingField: null,
  };
}

export class WhatsAppConversationStore {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private processedMessages: Map<string, CachedMessageReply> = new Map();

  getSession(phoneNumber: string): WhatsAppSession {
    const cleanPhone = normalizeMobile(phoneNumber);
    let session = this.sessions.get(cleanPhone);
    if (!session) {
      session = emptySession(cleanPhone);
      this.sessions.set(cleanPhone, session);
    }
    return session;
  }

  setSession(phoneNumber: string, updates: Partial<WhatsAppSession>): WhatsAppSession {
    const session = this.getSession(phoneNumber);
    Object.assign(session, updates, { lastActive: new Date().toISOString() });
    this.sessions.set(session.phoneNumber, session);
    return session;
  }

  bindIncident(phoneNumber: string, incidentId: string, state?: IncidentState): void {
    this.setSession(phoneNumber, {
      activeIncidentId: incidentId,
      lastState: state || "INTAKE",
    });
  }

  getCachedReply(messageId: string): CachedMessageReply | null {
    return this.processedMessages.get(messageId) || null;
  }

  cacheReply(messageId: string, reply: CachedMessageReply): void {
    this.processedMessages.set(messageId, reply);
  }

  clear(): void {
    this.sessions.clear();
    this.processedMessages.clear();
  }
}

export const defaultConversationStore = new WhatsAppConversationStore();
