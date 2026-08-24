/**
 * Raksha Core REST API Server
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { CreateIncidentInput, EvidenceType } from "@raksha/schemas";
import { globalEventBus } from "@raksha/shared";
import { incidentService } from "./incident-service.js";
import { evidenceService } from "./evidence-service.js";

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

export function createCoreServer() {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;
    const method = req.method || "GET";

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
          service: "raksha-core",
          version: "0.1.0",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 2. POST /v1/incidents
      if (pathname === "/v1/incidents" && method === "POST") {
        const body = await parseJsonBody<CreateIncidentInput>(req);
        if (!body.narrative || !body.narrative.text) {
          sendJson(res, 400, {
            error: "Missing required field: narrative.text",
          });
          return;
        }

        const incident = await incidentService.createIncident(body);
        sendJson(res, 201, {
          incidentId: incident.id,
          state: incident.state,
          incident,
        });
        return;
      }

      // 3. GET /v1/incidents
      if (pathname === "/v1/incidents" && method === "GET") {
        const incidents = await incidentService.listIncidents();
        sendJson(res, 200, { incidents });
        return;
      }

      // Regex for /v1/incidents/:id and sub-routes
      const incidentMatch = pathname.match(/^\/v1\/incidents\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_-]+))?$/);
      if (incidentMatch) {
        const incidentId = incidentMatch[1];
        const subRoute = incidentMatch[2];

        // GET /v1/incidents/:id
        if (!subRoute && method === "GET") {
          const incident = await incidentService.getIncident(incidentId);
          if (!incident) {
            sendJson(res, 404, { error: `Incident not found: ${incidentId}` });
            return;
          }
          sendJson(res, 200, incident);
          return;
        }

        // POST /v1/incidents/:id/evidence
        if (subRoute === "evidence" && method === "POST") {
          const body = await parseJsonBody<{
            type: EvidenceType;
            uri: string;
            sha256?: string;
            mimeType?: string;
            metadata?: Record<string, unknown>;
          }>(req);

          const incident = await incidentService.getIncident(incidentId);
          if (!incident) {
            sendJson(res, 404, { error: `Incident not found: ${incidentId}` });
            return;
          }

          const evidence = await evidenceService.addEvidence({
            incidentId,
            type: body.type || "TRANSACTION_SCREENSHOT",
            uri: body.uri,
            sha256: body.sha256,
            mimeType: body.mimeType,
            metadata: body.metadata,
          });

          // Add to incident evidence array
          incident.evidence.push(evidence.id);
          await incidentService.updateIncident(incidentId, {
            evidence: incident.evidence,
          });

          sendJson(res, 201, {
            evidenceId: evidence.id,
            sha256: evidence.sha256,
            evidence,
          });
          return;
        }

        // POST /v1/incidents/:id/validate
        if (subRoute === "validate" && method === "POST") {
          const validation = await incidentService.validateIncident(incidentId);
          sendJson(res, 200, {
            incidentId,
            validation,
          });
          return;
        }

        // GET /v1/incidents/:id/events
        if (subRoute === "events" && method === "GET") {
          const events = globalEventBus.getEvents({ incidentId });
          sendJson(res, 200, { incidentId, events });
          return;
        }
      }

      // Not found
      sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
    } catch (err) {
      console.error("[CoreServer Error]:", err);
      sendJson(res, 500, {
        error: (err as Error).message || "Internal Server Error",
      });
    }
  });

  return server;
}
