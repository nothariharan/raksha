/**
 * WhatsApp Webhook HTTP Server
 * Exposes the webhook endpoint for Twilio and WhatsApp Cloud API payloads.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { RawWhatsAppPayload } from "./message-normalizer.js";
import { WhatsAppService, defaultWhatsAppService } from "./whatsapp-service.js";

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Twilio-Signature",
  });
  res.end(JSON.stringify(data, null, 2));
}

export async function handleWhatsAppRequest(
  req: IncomingMessage,
  res: ServerResponse,
  service?: WhatsAppService
): Promise<void> {
  const ws = service || defaultWhatsAppService;
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Twilio-Signature",
    });
    res.end();
    return;
  }

  try {
    if (pathname === "/health" && method === "GET") {
      sendJson(res, 200, {
        status: "ok",
        service: "raksha-agent-whatsapp",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if ((pathname === "/whatsapp/webhook" || pathname === "/webhook") && method === "POST") {
      const body = await parseJsonBody<RawWhatsAppPayload>(req);
      const result = await ws.handleIncomingMessage(body);
      sendJson(res, 200, result);
      return;
    }

    if ((pathname === "/whatsapp/notify" || pathname === "/notify") && method === "POST") {
      const body = await parseJsonBody<{
        mobile: string;
        incidentId: string;
        referenceNumber: string;
        amount?: number;
        channel?: string;
        bank?: string;
        utr?: string;
      }>(req);
      const result = await ws.notifyCitizenIncidentAccepted(body);
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error("[WhatsAppWebhook Error]:", err);
    sendJson(res, 500, { error: (err as Error).message || "Internal Error" });
  }
}

export function createWhatsAppWebhookServer(service?: WhatsAppService) {
  return createServer((req, res) => handleWhatsAppRequest(req, res, service));
}
