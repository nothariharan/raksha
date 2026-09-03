/**
 * Phone Session & Call Context Manager
 * Maps incoming telephony calls to active canonical incidents.
 */

import { IncidentState } from "@raksha/schemas";
import { SupportedLanguage } from "@raksha/i18n";
import { TelephonyCallContext, TelephonyProviderType } from "./providers/interface.js";
import { normalizeMobile } from "@raksha/shared";

export interface PhoneSession {
  sessionId: string;
  callSid: string;
  callerNumber: string;
  provider: TelephonyProviderType;
  activeIncidentId: string | null;
  language: SupportedLanguage;
  lastState: IncidentState | null;
  startTime: string;
  lastActive: string;
}

export class PhoneSessionManager {
  private sessionsByCallSid: Map<string, PhoneSession> = new Map();
  private sessionsByCaller: Map<string, PhoneSession> = new Map();

  getOrCreateSession(context: TelephonyCallContext): PhoneSession {
    const cleanPhone = normalizeMobile(context.callerNumber);
    let session = this.sessionsByCallSid.get(context.callSid);

    if (!session && cleanPhone) {
      session = this.sessionsByCaller.get(cleanPhone);
    }

    if (!session) {
      session = {
        sessionId: `call-${Date.now()}`,
        callSid: context.callSid,
        callerNumber: context.callerNumber,
        provider: context.provider,
        activeIncidentId: null,
        language: (context.language?.slice(0, 2) as SupportedLanguage) || "hi",
        lastState: null,
        startTime: context.startTime || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      this.sessionsByCallSid.set(context.callSid, session);
      if (cleanPhone) {
        this.sessionsByCaller.set(cleanPhone, session);
      }
    }

    if (session && context.language) {
      session.language = (context.language.slice(0, 2) as SupportedLanguage);
    }

    return session;
  }

  getSessionByCallSid(callSid: string): PhoneSession | null {
    return this.sessionsByCallSid.get(callSid) || null;
  }

  bindIncident(callSid: string, incidentId: string, state?: IncidentState): void {
    const session = this.sessionsByCallSid.get(callSid);
    if (session) {
      session.activeIncidentId = incidentId;
      if (state) session.lastState = state;
      session.lastActive = new Date().toISOString();
    }
  }

  clear(): void {
    this.sessionsByCallSid.clear();
    this.sessionsByCaller.clear();
  }
}

export const defaultPhoneSessionManager = new PhoneSessionManager();
