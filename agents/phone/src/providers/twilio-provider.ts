/**
 * Twilio Voice Telephony Provider
 * Generates TwiML voice responses and gathers spoken input.
 */

import { ITelephonyProvider, TelephonyCallContext, VoiceToolCall, VoiceToolResult } from "./interface.js";
import { PhoneToolsHandler, defaultPhoneToolsHandler } from "../phone-tools.js";
import { PhoneSessionManager, defaultPhoneSessionManager } from "../session-manager.js";

export class TwilioTelephonyProvider implements ITelephonyProvider {
  name: "twilio" = "twilio";
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
    const greetingSpeech = "Namaste. Welcome to Raksha Emergency Cyber Response. Please speak your complaint.";

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">${greetingSpeech}</Say>
  <Gather input="speech" timeout="5" action="/phone/twilio/voice/process" method="POST">
    <Say voice="Polly.Aditi">Please tell us what happened.</Say>
  </Gather>
</Response>`;

    return {
      greetingSpeech,
      sessionId: session.sessionId,
      twimlOrResponse: twiml,
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

export const defaultTwilioProvider = new TwilioTelephonyProvider();
