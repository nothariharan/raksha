/**
 * Phone & Voice Telephony Webhook Server
 * Exposes endpoints for ElevenLabs agent tool calls, Twilio Voice, Exotel, and Browser simulator.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { PhoneService, defaultPhoneService } from "./phone-service.js";
import { TelephonyCallContext, VoiceToolCall } from "./providers/interface.js";

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

export function createPhoneWebhookServer(service?: PhoneService) {
  const ps = service || defaultPhoneService;

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
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

      // 2. ElevenLabs Conversational Tool Webhook
      if (pathname === "/phone/elevenlabs/tool" && method === "POST") {
        const body = await parseJsonBody<{
          tool_name: string;
          tool_call_id: string;
          parameters: Record<string, unknown>;
          caller_id?: string;
          conversation_id?: string;
          language?: string;
        }>(req);

        const context: TelephonyCallContext = {
          callSid: body.conversation_id || `eleven-${Date.now()}`,
          callerNumber: body.caller_id || "+919876543210",
          provider: "elevenlabs",
          language: body.language || "hi",
          startTime: new Date().toISOString(),
        };

        const toolCall: VoiceToolCall = {
          toolName: body.tool_name,
          toolCallId: body.tool_call_id,
          parameters: body.parameters || {},
        };

        const result = await ps.handleToolCall(toolCall, context);
        sendJson(res, 200, result);
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
  });

  return server;
}
