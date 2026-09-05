/**
 * ElevenLabs Conversational Voice AI Provider
 * Connects ElevenLabs Conversational Voice Agent webhooks and tool invocations to Raksha Core.
 */

import { ITelephonyProvider, TelephonyCallContext, VoiceToolCall, VoiceToolResult } from "./interface.js";
import { PhoneToolsHandler, defaultPhoneToolsHandler } from "../phone-tools.js";
import { PhoneSessionManager, defaultPhoneSessionManager } from "../session-manager.js";
import { detectSpokenLanguagePick } from "../language-pick.js";

export interface ElevenLabsWebhookPayload {
  agent_id?: string;
  conversation_id?: string;
  tool_name?: string;
  tool_call_id?: string;
  parameters?: Record<string, unknown>;
  caller_id?: string;
  user_id?: string;
  language?: string;
}

export class ElevenLabsTelephonyProvider implements ITelephonyProvider {
  name: "elevenlabs" = "elevenlabs";
  private tools: PhoneToolsHandler;
  private sessions: PhoneSessionManager;

  constructor(tools?: PhoneToolsHandler, sessions?: PhoneSessionManager) {
    this.tools = tools || defaultPhoneToolsHandler;
    this.sessions = sessions || defaultPhoneSessionManager;
  }

  async handleInboundCall(context: TelephonyCallContext): Promise<{
    greetingSpeech: string;
    sessionId: string;
  }> {
    const session = this.sessions.getOrCreateSession(context);
    const greetingSpeech = session.language === "hi"
      ? "नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए, हम तुरंत आपकी सहायता करेंगे। कृपया बताइए कि क्या हुआ?"
      : "Hello, welcome to Raksha Emergency Cyber Fraud Helpline. Please don't worry at all, we are here to assist you immediately. Please tell me what happened.";

    return {
      greetingSpeech,
      sessionId: session.sessionId,
    };
  }

  async handleToolCall(call: VoiceToolCall, context: TelephonyCallContext): Promise<VoiceToolResult> {
    const session = this.sessions.getOrCreateSession(context);
    const { toolName, toolCallId, parameters } = call;

    if (toolName === "start_incident" || toolName === "raksha_start_incident") {
      const narrative = String(parameters.narrative || parameters.text || "");
      const picked = detectSpokenLanguagePick(narrative);
      if (picked) session.language = picked;
      const res = await this.tools.startIncident({
        narrative,
        callerPhone: session.callerNumber,
        language: String(parameters.language || picked || session.language || "en"),
      });

      if (res.incidentId) this.sessions.bindIncident(context.callSid, res.incidentId, res.state as any);

      return {
        toolCallId,
        result: res,
        speechResponse: res.promptForCaller,
      };
    }

    if (toolName === "process_input" || toolName === "process_user_input" || toolName === "raksha_process_input") {
      const incidentId = String(parameters.incidentId || session.activeIncidentId || "").trim();
      const userSpeech = String(parameters.userSpeech || parameters.speech || parameters.text || "");
      const picked = detectSpokenLanguagePick(userSpeech);
      if (picked) session.language = picked;
      const isConfirmation = Boolean(parameters.isConfirmation);
      const confirmedField = parameters.confirmedField as string | undefined;
      const confirmedValue = parameters.confirmedValue;

      const res = await this.tools.processUserInput({
        incidentId: incidentId || undefined,
        userSpeech,
        isConfirmation,
        confirmedField,
        confirmedValue,
        language: String(parameters.language || picked || session.language || "en"),
        callerPhone: context.callerNumber,
      });

      if (res.incidentId) this.sessions.bindIncident(context.callSid, res.incidentId, res.state as any);

      return {
        toolCallId,
        result: res,
        speechResponse: res.promptForCaller,
      };
    }

    if (toolName === "submit_incident" || toolName === "raksha_submit_incident") {
      let incidentId = String(parameters.incidentId || session.activeIncidentId || "").trim();
      if (!incidentId && context.callerNumber) {
        const lookedUp = await this.tools.getIncidentStatus({ callerPhone: context.callerNumber });
        incidentId = String((lookedUp as { incident?: { id?: string } }).incident?.id || "");
      }
      if (!incidentId) {
        return {
          toolCallId,
          result: { success: false },
          speechResponse:
            "I do not have a report on this number yet. Please tell me what happened, including the amount and 12-digit UTR.",
        };
      }
      const res = await this.tools.submitIncident({
        incidentId,
        language: session.language,
      });

      this.sessions.bindIncident(
        context.callSid,
        incidentId,
        res.success ? "SUBMITTED" : session.lastState || "READY"
      );

      return {
        toolCallId,
        result: res,
        speechResponse: res.confirmationSpeech,
      };
    }

    if (toolName === "get_incident_status" || toolName === "raksha_get_status") {
      const incidentId = String(parameters.incidentId || session.activeIncidentId || "");
      const res = await this.tools.getIncidentStatus({
        incidentId: incidentId || undefined,
        callerPhone: context.callerNumber || session.callerNumber,
      });
      const incident = (res as { incident?: { id?: string; state?: string; handoff?: { externalReference?: string } } }).incident;
      const ref = incident?.handoff?.externalReference;
      const speech = incident
        ? ref
          ? `Your case ${incident.id} is ${incident.state}. Tracking reference ${ref}.`
          : `Your case ${incident.id} is ${incident.state}.`
        : "I do not have an open report on this number yet. Please tell me what happened.";
      return {
        toolCallId,
        result: res,
        speechResponse: speech,
      };
    }

    return {
      toolCallId,
      result: { error: `Unknown tool: ${toolName}` },
    };
  }

  async endCall(callSid: string): Promise<void> {
    const session = this.sessions.getSessionByCallSid(callSid);
    if (session) {
      session.lastState = null;
    }
  }
}

export const defaultElevenLabsProvider = new ElevenLabsTelephonyProvider();
