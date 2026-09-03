/**
 * Portal A REST API + government-style intake UI.
 * All case mutations go through CAP; Portal A keeps only local lifecycle state.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { FraudIncident } from "@raksha/schemas";
import { portalAIntakeService } from "./intake-service.js";
import { renderPortalAHtml } from "./html-template.js";
import { SYNTHETIC_INTAKE_INCIDENT, buildIncidentFromIntakeForm } from "./synthetic-data.js";

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
    pathname === "/report" ||
    pathname === "/review" ||
    pathname === "/index.html" ||
    pathname === "/portal-a" ||
    pathname === "/portal-a/" ||
    pathname === "/portal-a/report" ||
    pathname === "/portal-a/review" ||
    /^\/case\/[^/]+$/.test(pathname) ||
    /^\/portal-a\/case\/[^/]+$/.test(pathname)
  );
}

function incidentFromBody(body: Record<string, unknown>): FraudIncident | null {
  if (body.incident && typeof body.incident === "object") {
    return body.incident as FraudIncident;
  }
  if (typeof body.narrativeText === "string" && body.narrativeText.trim()) {
    return buildIncidentFromIntakeForm({
      narrativeText: body.narrativeText,
      amount: typeof body.amount === "number" ? body.amount : Number(body.amount),
      transactionId: String(body.transactionId || ""),
      timestamp: body.timestamp ? String(body.timestamp) : undefined,
      debitInstitution: body.debitInstitution ? String(body.debitInstitution) : undefined,
      beneficiaryIdentifier: body.beneficiaryIdentifier
        ? String(body.beneficiaryIdentifier)
        : undefined,
      beneficiaryInstitution: body.beneficiaryInstitution
        ? String(body.beneficiaryInstitution)
        : undefined,
      channel: (body.channel as FraudIncident["transaction"]["channel"]) || "UPI",
      reporterName: body.reporterName ? String(body.reporterName) : undefined,
      reporterMobile: body.reporterMobile ? String(body.reporterMobile) : undefined,
      evidence: body.evidence ? String(body.evidence) : undefined,
    });
  }
  return null;
}

export async function handlePortalARequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
          service: "raksha-portal-a",
          version: "0.1.0",
        });
        return;
      }

      if (method === "GET" && isUiRoute(pathname)) {
        sendHtml(res, renderPortalAHtml());
        return;
      }

      if (pathname === "/portal-a/cases" && method === "GET") {
        const cases = portalAIntakeService.listPortalCases();
        sendJson(res, 200, { cases });
        return;
      }

      const caseMatch = pathname.match(/^\/portal-a\/cases\/([^/]+)$/);
      if (caseMatch && method === "GET") {
        const id = decodeURIComponent(caseMatch[1]);
        const portalCase =
          portalAIntakeService.getPortalCase(id) ||
          portalAIntakeService.getPortalCaseByCapId(id);
        if (!portalCase) {
          sendJson(res, 404, { error: `Case not found: ${id}` });
          return;
        }
        sendJson(res, 200, { case: portalCase });
        return;
      }

      if (pathname === "/portal-a/cases/synthetic" && method === "POST") {
        const result = await portalAIntakeService.reportFraudIncident(
          SYNTHETIC_INTAKE_INCIDENT,
          req.headers["idempotency-key"]?.toString() || "synthetic-demo-001"
        );
        sendJson(res, result.success ? 201 : 400, result);
        return;
      }

      const ackMatch = pathname.match(/^\/portal-a\/cases\/([^/]+)\/acknowledge$/);
      if (ackMatch && method === "POST") {
        const id = decodeURIComponent(ackMatch[1]);
        const updated = await portalAIntakeService.acknowledgeCase(id);
        if (!updated) {
          sendJson(res, 404, { error: `Case not found: ${id}` });
          return;
        }
        sendJson(res, 200, { case: updated });
        return;
      }

      if (
        (pathname === "/portal-a/cases" || pathname === "/portal-a/intake") &&
        method === "POST"
      ) {
        const body = await parseJsonBody<Record<string, unknown>>(req);
        const incident = incidentFromBody(body);
        if (!incident) {
          sendJson(res, 400, { error: "Missing incident or intake form fields in body" });
          return;
        }

        const idempotencyKey =
          req.headers["idempotency-key"]?.toString() ||
          (typeof body.idempotencyKey === "string" ? body.idempotencyKey : undefined);

        const result = await portalAIntakeService.reportFraudIncident(incident, idempotencyKey);
        sendJson(res, result.success ? 201 : 400, result);
        return;
      }

      sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error("[Portal A Error]:", err);
    sendJson(res, 500, { error: (err as Error).message || "Internal Server Error" });
  }
}

export function createPortalAServer() {
  return createServer(handlePortalARequest);
}
