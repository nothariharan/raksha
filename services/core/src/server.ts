/**
 * Raksha Core REST API Server
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { CreateIncidentInput, EvidenceType } from "@raksha/schemas";
import { incidentService } from "./incident-service.js";
import { evidenceService } from "./evidence-service.js";
import { defaultEventRepository } from "./repositories/index.js";
import { MultimodalExtractor } from "./extraction/extractor.js";
import { ProcessInput, processService } from "./orchestration/process-service.js";
import { wirePersistentIdentity } from "./db/wire-identity.js";

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

export async function handleCoreRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
      // 1. Health checks
      if (pathname === "/health" && method === "GET") {
        sendJson(res, 200, {
          status: "ok",
          service: "raksha-core",
          version: "0.7.0",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (pathname === "/system/health" && method === "GET") {
        const unified = process.env.RAKSHA_GATEWAY_MODE === "unified";
        const gatewayPort = Number(process.env.PORT) || 3000;
        if (unified) {
          sendJson(res, 200, {
            status: "HEALTHY",
            mode: "unified",
            version: "0.7.0",
            protocol: "cap/0.1",
            timestamp: new Date().toISOString(),
            services: {
              gateway: { status: "UP", port: gatewayPort },
              core: { status: "UP", mount: "/v1" },
              cap: { status: "UP", mount: "/api/cap" },
              portalA: { status: "UP", mount: "/portal-a" },
              portalB: { status: "UP", mount: "/portal-b" },
              whatsapp: { status: "UP", mount: "/whatsapp" },
              phone: { status: "UP", mount: "/phone" },
              mcp: { status: "UP", mount: "/mcp" },
            },
          });
          return;
        }

        sendJson(res, 200, {
          status: "HEALTHY",
          mode: "multi-process",
          version: "0.7.0",
          protocol: "cap/0.1",
          timestamp: new Date().toISOString(),
          services: {
            core: { status: "UP", port: Number(process.env.PORT_CORE) || 3001 },
            cap: { status: "UP", port: Number(process.env.PORT_CAP) || 3002 },
            portalA: { status: "UP", port: Number(process.env.PORT_PORTAL_A) || 3003 },
            portalB: { status: "UP", port: Number(process.env.PORT_PORTAL_B) || 3004 },
            web: { status: "UP", port: Number(process.env.PORT_WEB) || 3000 },
            whatsapp: { status: "UP", port: Number(process.env.PORT_WHATSAPP) || 3005 },
            phone: { status: "UP", port: Number(process.env.PORT_PHONE) || 3006 },
            mcp: { status: "UP", port: Number(process.env.PORT_MCP) || 3007 },
          },
        });
        return;
      }

      // 2. Multimodal Extraction Endpoints
      if (pathname === "/v1/extract/text" && method === "POST") {
        const body = await parseJsonBody<{ text: string; language?: string }>(req);
        if (!body.text) {
          sendJson(res, 400, { error: "Missing required field: text" });
          return;
        }
        const candidate = MultimodalExtractor.extractCandidate({
          modality: "text",
          content: body.text,
          language: body.language || "en",
        });
        sendJson(res, 200, { candidate });
        return;
      }

      if (pathname === "/v1/extract/image" && method === "POST") {
        const body = await parseJsonBody<{ imageContent: string; language?: string }>(req);
        if (!body.imageContent) {
          sendJson(res, 400, { error: "Missing required field: imageContent" });
          return;
        }
        const candidate = MultimodalExtractor.extractCandidate({
          modality: "image",
          content: body.imageContent,
          language: body.language || "en",
        });
        sendJson(res, 200, { candidate });
        return;
      }

      if (pathname === "/v1/extract/voice" && method === "POST") {
        const body = await parseJsonBody<{ audioTranscript: string; language?: string }>(req);
        if (!body.audioTranscript) {
          sendJson(res, 400, { error: "Missing required field: audioTranscript" });
          return;
        }
        const candidate = MultimodalExtractor.extractCandidate({
          modality: "voice",
          content: body.audioTranscript,
          language: body.language || "en",
        });
        sendJson(res, 200, { candidate });
        return;
      }

      // 3. Unified Multimodal Process Orchestration Endpoint
      if (pathname === "/v1/process" && method === "POST") {
        const body = await parseJsonBody<ProcessInput>(req);
        if (!body.content && !body.userClarificationAnswer) {
          sendJson(res, 400, { error: "Missing content or userClarificationAnswer in body" });
          return;
        }
        const result = await processService.processInput(body);
        sendJson(res, 200, result);
        return;
      }

      // 3b. ElevenLabs Real-Time Voice Synthesis Stream
      if (pathname === "/v1/tts" && method === "POST") {
        const body = await parseJsonBody<{ text: string; voiceId?: string }>(req);
        const text = body.text || "नमस्ते, रक्षा आपातकालीन हेल्पलाइन में आपका स्वागत है।";
        const apiKey = process.env.ELEVENLABS_API_KEY;
        const voiceId = body.voiceId || "21m00Tcm4TlvDq8ikWAM";

        if (!apiKey || apiKey.startsWith("synthetic")) {
          sendJson(res, 200, { synthesized: false });
          return;
        }

        try {
          const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_multilingual_v2",
              voice_settings: { stability: 0.5, similarity_boost: 0.8 },
            }),
          });

          if (ttsRes.ok) {
            const audioBuffer = await ttsRes.arrayBuffer();
            res.writeHead(200, {
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.byteLength,
              "Access-Control-Allow-Origin": "*",
            });
            res.end(Buffer.from(audioBuffer));
            return;
          }
        } catch (e) {
          console.warn("[Core TTS Error]:", e);
        }
        sendJson(res, 500, { error: "TTS generation failed" });
        return;
      }

      // 4. POST /v1/incidents
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

      // 5. GET /v1/incidents
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
          const events = await defaultEventRepository.findByIncidentId(incidentId);
          sendJson(res, 200, { incidentId, events });
          return;
        }
      }

      sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error("[CoreServer Error]:", err);
    sendJson(res, 500, {
      error: (err as Error).message || "Internal Server Error",
    });
  }
}

export function createCoreServer() {
  // Best-effort: sync file sequences + wire event ids (prod path awaits wirePersistentIdentity).
  void wirePersistentIdentity().catch((err) => {
    console.warn("[CoreServer] identity wire notice:", (err as Error).message);
  });
  return createServer(handleCoreRequest);
}
