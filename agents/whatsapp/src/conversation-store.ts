/**
 * WhatsApp Session & Conversation Store
 * Maps user mobile phone numbers to active canonical Raksha incidents and handles webhook idempotency.
 */

import { IncidentState } from "@raksha/schemas";
import { SupportedLanguage } from "@raksha/i18n";

export interface WhatsAppSession {
  phoneNumber: string;
  activeIncidentId: string | null;
  language: SupportedLanguage;
  lastState: IncidentState | null;
  lastActive: string;
}

export interface CachedMessageReply {
  messageId: string;
  replyText: string;
  incidentId: string | null;
  state: IncidentState | null;
  processedAt: string;
}

export class WhatsAppConversationStore {
  private sessions: Map<string, WhatsAppSession> = new Map();
  private processedMessages: Map<string, CachedMessageReply> = new Map();

  getSession(phoneNumber: string): WhatsAppSession {
    const cleanPhone = phoneNumber.replace(/whatsapp:/i, "").trim();
    let session = this.sessions.get(cleanPhone);
    if (!session) {
      session = {
        phoneNumber: cleanPhone,
        activeIncidentId: null,
        language: "en",
        lastState: null,
        lastActive: new Date().toISOString(),
      };
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
