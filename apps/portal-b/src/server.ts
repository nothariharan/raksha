/**
 * Portal B REST API + Operational Financial Intermediary Console UI server.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { portalBResponseService } from "./response-service.js";
import { renderPortalBHtml } from "./html-template.js";

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key",
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendHtml(res: ServerResponse, html: string): void {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function isUiRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/incidents" ||
    /^\/incidents\/[^/]+$/.test(pathname)
  );
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
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key",
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

      if (method === "GET" && isUiRoute(pathname)) {
        sendHtml(res, renderPortalBHtml());
        return;
      }

      if (pathname === "/portal-b/alerts" && method === "GET") {
        const alerts = await portalBResponseService.pollEventsFromHttp();
        sendJson(res, 200, { alerts });
        return;
      }

      if (pathname === "/portal-b/alerts/poll" && method === "POST") {
        const alerts = await portalBResponseService.pollEventsFromHttp();
        sendJson(res, 200, { alerts });
        return;
      }

      const alertMatch = pathname.match(/^\/portal-b\/alerts\/([^/]+)$/);
      if (alertMatch && method === "GET") {
        const id = decodeURIComponent(alertMatch[1]);
        const alert = portalBResponseService.getAlert(id);
        if (!alert) {
          sendJson(res, 404, { error: `Alert not found: ${id}` });
          return;
        }
        sendJson(res, 200, { alert });
        return;
      }

      const ackMatch = pathname.match(/^\/portal-b\/alerts\/([^/]+)\/acknowledge$/);
      if (ackMatch && method === "POST") {
        const id = decodeURIComponent(ackMatch[1]);
        const body = await parseJsonBody<{
          responderInstitution: string;
          actionTaken: "LIEN_MARKED" | "ACCOUNT_FROZEN" | "TRANSACTION_TRACED" | "FLAGGED_FOR_REVIEW";
          operatorNotes?: string;
        }>(req);

        const alert = portalBResponseService.getAlert(id);
        if (!alert) {
          sendJson(res, 404, { error: `Alert not found: ${id}` });
          return;
        }

        const result = await portalBResponseService.acknowledgeFreeze({
          caseId: id,
          incidentId: alert.incidentId,
          responderInstitution: body.responderInstitution || "Synthetic Responder Node",
          actionTaken: body.actionTaken || "LIEN_MARKED",
          operatorNotes: body.operatorNotes,
        });

        sendJson(res, result.success ? 200 : 400, result);
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
