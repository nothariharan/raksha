/**
 * Phone & Voice Telephony Webhook Server
 * Exposes endpoints for ElevenLabs agent tool calls, Twilio Voice, Exotel, and Browser simulator.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { PhoneService, defaultPhoneService } from "./phone-service.js";
import { TelephonyCallContext, VoiceToolCall } from "./providers/interface.js";
import { normalizeElevenLabsToolRequest } from "./elevenlabs-webhook.js";
import { incidentService } from "@raksha/core";
import { normalizeMobile } from "@raksha/shared";

function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        if (!data || data.trim() === "") {
          resolve({} as T);
        } else {
          resolve(JSON.parse(data) as T);
        }
      } catch (err) {
        reject(new Error(`Invalid JSON body: ${(err as Error).message}`));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-ElevenLabs-Signature",
  });
  res.end(JSON.stringify(data, null, 2));
}

export async function handlePhoneRequest(
  req: IncomingMessage,
  res: ServerResponse,
  service?: PhoneService
): Promise<void> {
  const ps = service || defaultPhoneService;
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  try {
    // 1. Health check
    if (pathname === "/health" && method === "GET") {
      sendJson(res, 200, {
        status: "ok",
        service: "raksha-agent-phone",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 2. ElevenLabs Conversational Tool Webhook (PSTN + workspace webhook tools)
    if (
      (pathname === "/phone/elevenlabs/tool" || pathname.startsWith("/phone/elevenlabs/tool/")) &&
      method === "POST"
    ) {
      const raw = await parseJsonBody<Record<string, unknown>>(req);
      const pathTool = pathname.replace("/phone/elevenlabs/tool/", "").replace("/phone/elevenlabs/tool", "");
      if (pathTool && pathTool !== pathname && !raw.tool_name && !raw.toolName) {
        raw.tool_name = pathTool;
      }
      const headerBag: Record<string, string | string[] | undefined> = {};
      for (const [key, value] of Object.entries(req.headers)) headerBag[key] = value;
      const parsed = normalizeElevenLabsToolRequest({
        body: raw,
        query: url.searchParams,
        headers: headerBag,
      });

      const context: TelephonyCallContext = {
        callSid: parsed.conversationId,
        callerNumber: parsed.callerNumber,
        provider: "elevenlabs",
        language: parsed.language || "en",
        startTime: new Date().toISOString(),
      };

      const toolCall: VoiceToolCall = {
        toolName: parsed.toolName,
        toolCallId: parsed.toolCallId,
        parameters: parsed.parameters,
      };

      const result = await ps.handleToolCall(toolCall, context);
      const spoken =
        result.speechResponse ||
        (typeof (result.result as { promptForCaller?: string })?.promptForCaller === "string"
          ? (result.result as { promptForCaller: string }).promptForCaller
          : undefined) ||
        (typeof (result.result as { confirmationSpeech?: string })?.confirmationSpeech === "string"
          ? (result.result as { confirmationSpeech: string }).confirmationSpeech
          : undefined);
      sendJson(res, 200, {
        ...((result.result && typeof result.result === "object") ? result.result : { result: result.result }),
        speech: spoken,
        speechResponse: spoken,
        toolCallId: result.toolCallId,
      });
      return;
    }

    if (pathname === "/phone/elevenlabs/init" && method === "POST") {
      const body = await parseJsonBody<{ caller_id?: string; conversation_id?: string }>(req);
      const caller = normalizeMobile(body.caller_id || "");
      const open = caller ? await incidentService.findOpenByMobile(caller) : null;
      const latest = caller && !open ? await incidentService.findLatestByMobile(caller) : null;
      const incident = open || latest;
      sendJson(res, 200, {
        conversation_initiation_client_data: {
          dynamic_variables: {
            incident_id: incident?.id || "",
            incident_state: incident?.state || "",
            tracking_ref: incident?.handoff?.externalReference || "",
          },
        },
      });
      return;
    }

    // 3. Twilio Inbound Voice Webhook
    if (pathname === "/phone/twilio/voice" && method === "POST") {
      const body = await parseJsonBody<{ CallSid?: string; From?: string; To?: string }>(req);
      const context: TelephonyCallContext = {
        callSid: body.CallSid || `tw-${Date.now()}`,
        callerNumber: body.From || "+919876543210",
        calledNumber: body.To,
        provider: "twilio",
        startTime: new Date().toISOString(),
      };

      const result = await ps.handleInboundCall(context);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(result.twimlOrResponse || "<Response><Say>Raksha Helpline</Say></Response>");
      return;
    }

    // 4. Browser / Demo Phone Mode Simulator
    if (pathname === "/phone/simulate" && method === "POST") {
      const body = await parseJsonBody<{
        callSid: string;
        callerPhone: string;
        action: "start" | "speech" | "submit";
        speechText?: string;
        isConfirmation?: boolean;
        language?: string;
      }>(req);

      const result = await ps.simulatePhoneTurn(body);
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error("[PhoneWebhook Error]:", err);
    sendJson(res, 500, { error: (err as Error).message || "Internal Server Error" });
  }
}

export function createPhoneWebhookServer(service?: PhoneService) {
  return createServer((req, res) => handlePhoneRequest(req, res, service));
}
