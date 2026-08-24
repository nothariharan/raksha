/**
 * Telephony & Voice AI Provider Interface
 * Allows swapping between ElevenLabs, Twilio, Exotel, and Browser simulator with zero core changes.
 */

import { InputEvent, ProcessResponse } from "@raksha/schemas";

export type TelephonyProviderType = "elevenlabs" | "twilio" | "exotel" | "browser";

export interface TelephonyCallContext {
  callSid: string;
  callerNumber: string;
  calledNumber?: string;
  provider: TelephonyProviderType;
  language?: string;
  startTime: string;
  metadata?: Record<string, unknown>;
}

export interface VoiceToolCall {
  toolName: string;
  toolCallId: string;
  parameters: Record<string, unknown>;
}

export interface VoiceToolResult {
  toolCallId: string;
  result: unknown;
  speechResponse?: string;
}

export interface ITelephonyProvider {
  name: TelephonyProviderType;
  handleInboundCall(context: TelephonyCallContext): Promise<{
    greetingSpeech: string;
    sessionId: string;
    twimlOrResponse?: string;
  }>;
  handleToolCall(call: VoiceToolCall, context: TelephonyCallContext): Promise<VoiceToolResult>;
  endCall(callSid: string): Promise<void>;
}
