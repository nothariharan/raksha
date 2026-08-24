/**
 * Exotel Indian Telephony Provider
 * Handles Exotel Voicebot Applet Webhook and WebSocket audio streaming.
 */

import { ITelephonyProvider, TelephonyCallContext, VoiceToolCall, VoiceToolResult } from "./interface.js";
import { PhoneToolsHandler, defaultPhoneToolsHandler } from "../phone-tools.js";
import { PhoneSessionManager, defaultPhoneSessionManager } from "../session-manager.js";

export class ExotelTelephonyProvider implements ITelephonyProvider {
  name: "exotel" = "exotel";
  private tools: PhoneToolsHandler;
  private sessions: PhoneSessionManager;

  constructor(tools?: PhoneToolsHandler, sessions?: PhoneSessionManager) {
    this.tools = tools || defaultPhoneToolsHandler;
    this.sessions = sessions || defaultPhoneSessionManager;
  }

  async handleInboundCall(context: TelephonyCallContext): Promise<{
    greetingSpeech: string;
    sessionId: string;
    twimlOrResponse: string;
  }> {
    const session = this.sessions.getOrCreateSession(context);
    const greetingSpeech = "नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है।";

    const exotelResponse = JSON.stringify({
      action: "stream",
      greeting: greetingSpeech,
      sessionId: session.sessionId,
    });

    return {
      greetingSpeech,
      sessionId: session.sessionId,
      twimlOrResponse: exotelResponse,
    };
  }

  async handleToolCall(call: VoiceToolCall, context: TelephonyCallContext): Promise<VoiceToolResult> {
    return {
      toolCallId: call.toolCallId,
      result: { status: "ok" },
    };
  }

  async endCall(callSid: string): Promise<void> {}
}

export const defaultExotelProvider = new ExotelTelephonyProvider();
