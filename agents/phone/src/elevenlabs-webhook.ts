/**
 * Normalize ElevenLabs ConvAI webhook/tool payloads into Raksha phone tools.
 * PSTN calls POST the tool body (no browser client tools).
 */

export interface NormalizedElevenLabsToolCall {
  toolName: string;
  toolCallId: string;
  parameters: Record<string, unknown>;
  callerNumber: string;
  conversationId: string;
  language?: string;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

const HELPLINE_DID = /^\+?1?6055999677$/;

export function resolveCitizenNumber(rawCaller: string, citizenNumber: string): string {
  const caller = rawCaller.replace(/\s/g, "");
  const citizen = citizenNumber.replace(/\s/g, "");
  if (caller && HELPLINE_DID.test(caller) && citizen) return citizen;
  return caller || citizen;
}

export function inferToolName(body: Record<string, unknown>, queryName?: string): string {
  const named = firstString(
    queryName,
    body.tool_name,
    body.toolName,
    body.name
  );
  if (named) return named;
  if (body.confirmedByCitizen !== undefined || body.confirmed_by_citizen !== undefined) {
    return "raksha_submit_incident";
  }
  if (firstString(body.userSpeech, body.speech, body.text) && !firstString(body.narrative)) {
    return "raksha_process_input";
  }
  if (firstString(body.narrative)) return "raksha_start_incident";
  if (/status|track|report/i.test(firstString(body.intent, body.userSpeech, body.speech))) {
    return "raksha_get_status";
  }
  return "raksha_process_input";
}

export function normalizeElevenLabsToolRequest(input: {
  body: unknown;
  query?: URLSearchParams;
  headers?: Record<string, string | string[] | undefined>;
}): NormalizedElevenLabsToolCall {
  const body = asRecord(input.body);
  const nested = asRecord(body.parameters);
  const query = input.query;
  const headers = input.headers || {};
  const headerCaller = firstString(
    headers["x-caller-id"],
    headers["x-elevenlabs-caller-id"]
  );

  const dyn = asRecord(body.dynamic_variables);
  const rawCaller = firstString(
    body.caller_id,
    body.callerId,
    body.system__caller_id,
    nested.caller_id,
    nested.callerId,
    dyn.system__caller_id,
    query?.get("caller_id"),
    headerCaller
  );
  const citizenNumber = firstString(
    body.system__user_id,
    body.system__called_number,
    body.user_id,
    nested.system__user_id,
    nested.system__called_number,
    nested.user_id,
    dyn.system__user_id,
    dyn.system__called_number,
    body.called_number,
    nested.called_number
  );
  const callerNumber = resolveCitizenNumber(rawCaller, citizenNumber) || "+919876543210";

  const conversationId = firstString(
    body.conversation_id,
    body.conversationId,
    body.system__conversation_id,
    nested.conversation_id,
    query?.get("conversation_id"),
    `eleven-${Date.now()}`
  );

  const language = firstString(body.language, nested.language, query?.get("language")) || undefined;
  const toolName = inferToolName(body, query?.get("name") || query?.get("tool") || undefined);
  const toolCallId = firstString(body.tool_call_id, body.toolCallId, `el-${Date.now()}`);

  const parameters: Record<string, unknown> = { ...nested, ...body };
  delete parameters.parameters;
  delete parameters.tool_name;
  delete parameters.toolName;
  delete parameters.tool_call_id;
  delete parameters.caller_id;
  delete parameters.callerId;
  delete parameters.system__caller_id;
  delete parameters.conversation_id;
  delete parameters.conversationId;
  delete parameters.system__conversation_id;

  return {
    toolName,
    toolCallId,
    parameters,
    callerNumber,
    conversationId,
    language,
  };
}
