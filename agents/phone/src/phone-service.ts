/**
 * Unified Phone Service for Raksha
 * Routes incoming calls and tool invocations across ElevenLabs, Twilio, Exotel, and Simulator.
 */

import {
  ITelephonyProvider,
  TelephonyCallContext,
  TelephonyProviderType,
  VoiceToolCall,
  VoiceToolResult,
} from "./providers/interface.js";
import { defaultElevenLabsProvider } from "./providers/elevenlabs-provider.js";
import { defaultTwilioProvider } from "./providers/twilio-provider.js";
import { defaultExotelProvider } from "./providers/exotel-provider.js";
import { defaultPhoneSessionManager, PhoneSessionManager } from "./session-manager.js";

export class PhoneService {
  private providers: Map<TelephonyProviderType, ITelephonyProvider> = new Map();
  private sessions: PhoneSessionManager;

  constructor(sessions?: PhoneSessionManager) {
    this.sessions = sessions || defaultPhoneSessionManager;
    this.providers.set("elevenlabs", defaultElevenLabsProvider);
    this.providers.set("twilio", defaultTwilioProvider);
    this.providers.set("exotel", defaultExotelProvider);
  }

  getProvider(name: TelephonyProviderType = "elevenlabs"): ITelephonyProvider {
    const p = this.providers.get(name);
    if (!p) return defaultElevenLabsProvider;
    return p;
  }

  async handleInboundCall(context: TelephonyCallContext) {
    const provider = this.getProvider(context.provider);
    return provider.handleInboundCall(context);
  }

  async handleToolCall(call: VoiceToolCall, context: TelephonyCallContext): Promise<VoiceToolResult> {
    const provider = this.getProvider(context.provider);
    return provider.handleToolCall(call, context);
  }

  /**
   * Browser / Simulator Phone Mode (Mode B):
   * Runs a complete synthetic conversational turn sequence.
   */
  async simulatePhoneTurn(params: {
    callSid: string;
    callerPhone: string;
    action: "start" | "speech" | "submit";
    speechText?: string;
    isConfirmation?: boolean;
    language?: string;
  }): Promise<{
    sessionId: string;
    incidentId: string | null;
    state: string | null;
    spokenResponse: string;
    isReady: boolean;
  }> {
    const context: TelephonyCallContext = {
      callSid: params.callSid,
      callerNumber: params.callerPhone,
      provider: "elevenlabs",
      language: params.language || "hi",
      startTime: new Date().toISOString(),
    };

    if (params.action === "start") {
      const toolRes = await this.handleToolCall(
        {
          toolName: "start_incident",
          toolCallId: `call-${Date.now()}`,
          parameters: {
            narrative: params.speechText || "Someone took money from my account",
            callerPhone: params.callerPhone,
          },
        },
        context
      );
      const res = toolRes.result as { incidentId: string; state: string; promptForCaller: string; isReady: boolean };
      return {
        sessionId: params.callSid,
        incidentId: res.incidentId,
        state: res.state,
        spokenResponse: toolRes.speechResponse || res.promptForCaller,
        isReady: res.isReady,
      };
    }

    if (params.action === "speech") {
      const toolRes = await this.handleToolCall(
        {
          toolName: "process_input",
          toolCallId: `call-${Date.now()}`,
          parameters: {
            userSpeech: params.speechText || "",
            isConfirmation: params.isConfirmation,
          },
        },
        context
      );
      const res = toolRes.result as { incidentId: string; state: string; promptForCaller: string; isReady: boolean };
      return {
        sessionId: params.callSid,
        incidentId: res.incidentId,
        state: res.state,
        spokenResponse: toolRes.speechResponse || res.promptForCaller,
        isReady: res.isReady,
      };
    }

    if (params.action === "submit") {
      const toolRes = await this.handleToolCall(
        {
          toolName: "submit_incident",
          toolCallId: `call-${Date.now()}`,
          parameters: {},
        },
        context
      );
      const res = toolRes.result as { officialReference: string; caseId: string; confirmationSpeech: string };
      return {
        sessionId: params.callSid,
        incidentId: null,
        state: "SUBMITTED",
        spokenResponse: toolRes.speechResponse || res.confirmationSpeech,
        isReady: true,
      };
    }

    return {
      sessionId: params.callSid,
      incidentId: null,
      state: "IDLE",
      spokenResponse: "Call ended.",
      isReady: false,
    };
  }
}

export const defaultPhoneService = new PhoneService();
