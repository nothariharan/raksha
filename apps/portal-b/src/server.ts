/**
 * Portal B — Financial Intermediary Response Console HTTP Server
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { portalBResponseService } from "./response-service.js";

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data, null, 2));
}

export function createPortalBServer() {
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
      if (pathname === "/health" && method === "GET") {
        sendJson(res, 200, {
          status: "ok",
          service: "raksha-portal-b",
          version: "0.7.0",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (pathname === "/portal-b/alerts" && method === "GET") {
        const alerts = await portalBResponseService.pollEventsFromHttp();
        sendJson(res, 200, { alerts });
        return;
      }

      if (pathname === "/portal-b/acknowledge" && method === "POST") {
        const body = await parseJsonBody<any>(req);
        const result = await portalBResponseService.acknowledgeFreeze(body);
        sendJson(res, 200, result);
        return;
      }

      sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
    } catch (err) {
      console.error("[Portal B Error]:", err);
      sendJson(res, 500, { error: (err as Error).message || "Internal Server Error" });
    }
  });

  return server;
}
