/**
 * Persistent CAP REST API Server
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { CAPActionName, FraudIncident } from "@raksha/schemas";
import { defaultEventRepository } from "@raksha/core";
import { capabilityRegistry } from "./capability-registry.js";
import { actionRouter } from "./action-router.js";
import { CAP_GOVERNMENT_MANIFEST } from "./manifest.js";

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
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key",
  });
  res.end(JSON.stringify(data, null, 2));
}

export async function handleCapRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname = url.pathname;
  if (pathname.startsWith("/api/cap")) {
    pathname = pathname.replace(/^\/api\/cap/, "/cap");
  }
  const method = req.method || "GET";
  const idempotencyKey =
    (req.headers["idempotency-key"] as string) || url.searchParams.get("idempotencyKey") || undefined;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key",
    });
    res.end();
    return;
  }

  try {
      // 1. Health check
      if (pathname === "/health" && method === "GET") {
        sendJson(res, 200, {
          status: "ok",
          service: "raksha-cap",
          version: "0.1.0",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 2. GET /cap/capabilities
      if (pathname === "/cap/capabilities" && method === "GET") {
        const capabilities = capabilityRegistry.list();
        sendJson(res, 200, {
          protocol: "cap/0.1",
          manifest: CAP_GOVERNMENT_MANIFEST,
          capabilities,
        });
        return;
      }

      // 3. POST /cap/cases
      if (pathname === "/cap/cases" && method === "POST") {
        const body = await parseJsonBody<{ incident: FraudIncident; idempotencyKey?: string }>(req);
        if (!body.incident) {
          sendJson(res, 400, { error: "Missing incident object in request body" });
          return;
        }

        const response = await actionRouter.executeAction(
          "report_financial_fraud",
          body.incident,
          idempotencyKey || body.idempotencyKey
        );
        sendJson(res, response.success ? 201 : 400, response);
        return;
      }

      // 4. POST /cap/actions/validate
      if (pathname === "/cap/actions/validate" && method === "POST") {
        const body = await parseJsonBody<{ action: CAPActionName; payload: unknown }>(req);
        const result = await actionRouter.validateAction(body.action, body.payload);
        sendJson(res, 200, result);
        return;
      }

      // 5. POST /cap/actions/execute
      if (pathname === "/cap/actions/execute" && method === "POST") {
        const body = await parseJsonBody<{
          action: CAPActionName;
          payload: unknown;
          idempotencyKey?: string;
        }>(req);
        const response = await actionRouter.executeAction(
          body.action,
          body.payload,
          idempotencyKey || body.idempotencyKey
        );
        sendJson(res, response.success ? 200 : 400, response);
        return;
      }

      // 6. GET /cap/events (supports ?since=...&type=...&caseId=...)
      if (pathname === "/cap/events" && method === "GET") {
        const since = url.searchParams.get("since") || undefined;
        const type = url.searchParams.get("type") || undefined;
        const caseId = url.searchParams.get("caseId") || undefined;
        const incidentId = url.searchParams.get("incidentId") || undefined;

        const events = await defaultEventRepository.list({ since, type, caseId, incidentId });
        sendJson(res, 200, { events });
        return;
      }

      // 7. POST /cap/events
      if (pathname === "/cap/events" && method === "POST") {
        const body = await parseJsonBody<{
          type: string;
          caseId: string;
          incidentId?: string;
          source: string;
          payload: unknown;
        }>(req);

        const event = await defaultEventRepository.append({
          id: `EVT-${Date.now()}`,
          type: body.type,
          caseId: body.caseId,
          incidentId: body.incidentId,
          source: body.source,
          payload: body.payload,
          timestamp: new Date().toISOString(),
        });
        sendJson(res, 201, event);
        return;
      }

      // Regex for /cap/cases/:id and /cap/cases/:id/events
      const caseMatch = pathname.match(/^\/cap\/cases\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?$/);
      if (caseMatch) {
        const caseId = caseMatch[1];
        const subRoute = caseMatch[2];

        // GET /cap/cases/:id
        if (!subRoute && method === "GET") {
          const capCase = await actionRouter.getCase(caseId);
          if (!capCase) {
            sendJson(res, 404, { error: `CAP Case not found: ${caseId}` });
            return;
          }
          sendJson(res, 200, { case: capCase });
          return;
        }

        // GET /cap/cases/:id/events
        if (subRoute === "events" && method === "GET") {
          const events = await defaultEventRepository.findByCaseId(caseId);
          sendJson(res, 200, { caseId, events });
          return;
        }
      }

      sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error("[CAP Server Error]:", err);
    sendJson(res, 500, {
      error: (err as Error).message || "Internal Server Error",
    });
  }
}

export function createCapServer() {
  return createServer(handleCapRequest);
}
