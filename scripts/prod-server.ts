/**
 * Raksha Protocol Host
 * Long-running Node gateway for Core, CAP, portals, and channel webhooks.
 * The citizen website is served from Vercel; this process keeps APIs and adapters.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { handleCoreRequest } from "@raksha/core";
import { handleCapRequest } from "@raksha/cap";
import { handlePortalARequest } from "@raksha/portal-a";
import { handlePortalBRequest } from "@raksha/portal-b";
import { handleWebRequest } from "@raksha/web";
import { handleWhatsAppRequest } from "@raksha/agent-whatsapp";
import { handlePhoneRequest } from "@raksha/agent-phone";
import { handleMcpRequest } from "@raksha/agent-mcp";
import { defaultDbClient } from "@raksha/core";

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_WEB_ORIGIN = (process.env.PUBLIC_WEB_ORIGIN || "").replace(/\/$/, "");
const SAME_ORIGIN_WEB = { coreUrl: "", capUrl: "" };
const WEB_PAGE_PATHS = new Set(["/", "/how", "/agents", "/cap", "/app", "/demo", "/index.html"]);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Idempotency-Key",
  "Access-Control-Max-Age": "86400",
};

function isApiPath(pathname: string): boolean {
  return (
    pathname.startsWith("/v1") ||
    pathname.startsWith("/api/cap") ||
    pathname.startsWith("/cap/") ||
    pathname.startsWith("/portal-") ||
    pathname.startsWith("/whatsapp") ||
    pathname.startsWith("/phone") ||
    pathname.startsWith("/mcp") ||
    pathname === "/system/health" ||
    pathname === "/health" ||
    pathname === "/ready"
  );
}

function redirectToWebsite(res: ServerResponse, destination: string): void {
  res.writeHead(302, {
    Location: destination,
    "Cache-Control": "no-store",
  });
  res.end();
}

export function createUnifiedGatewayServer() {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;
    const method = req.method || "GET";

    if (method === "OPTIONS" && isApiPath(pathname)) {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    if (pathname === "/health") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      });
      res.end(
        JSON.stringify(
          {
            status: "healthy",
            service: "raksha-protocol-host",
            version: "0.7.0",
            protocol: "cap/0.1",
            database: defaultDbClient.isPg() ? "postgresql" : "file",
            website: PUBLIC_WEB_ORIGIN || null,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      return;
    }

    if (pathname === "/ready") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      });
      res.end(JSON.stringify({ status: "ready" }));
      return;
    }

    if (pathname === "/system/health") {
      await handleCoreRequest(req, res);
      return;
    }

    const normalizedPage = pathname === "/index.html" ? "/" : pathname.replace(/\/$/, "") || "/";
    if (PUBLIC_WEB_ORIGIN && WEB_PAGE_PATHS.has(normalizedPage)) {
      redirectToWebsite(res, `${PUBLIC_WEB_ORIGIN}${normalizedPage === "/" ? "/" : normalizedPage}${url.search}`);
      return;
    }

    if (pathname === "/cap" || pathname === "/cap/") {
      handleWebRequest(req, res, SAME_ORIGIN_WEB);
      return;
    }

    if (pathname.startsWith("/api/cap") || pathname.startsWith("/cap/")) {
      await handleCapRequest(req, res);
      return;
    }

    if (pathname.startsWith("/v1/") || pathname === "/v1") {
      await handleCoreRequest(req, res);
      return;
    }

    if (pathname.startsWith("/portal-a")) {
      await handlePortalARequest(req, res);
      return;
    }

    if (pathname.startsWith("/portal-b")) {
      await handlePortalBRequest(req, res);
      return;
    }

    if (pathname.startsWith("/whatsapp")) {
      await handleWhatsAppRequest(req, res);
      return;
    }

    if (pathname.startsWith("/phone")) {
      await handlePhoneRequest(req, res);
      return;
    }

    if (pathname.startsWith("/mcp")) {
      await handleMcpRequest(req, res);
      return;
    }

    handleWebRequest(req, res, SAME_ORIGIN_WEB);
  });
}

export async function startProductionGateway(): Promise<void> {
  console.log("==========================================================");
  console.log("  STARTING RAKSHA PROTOCOL HOST");
  console.log("==========================================================");

  if (defaultDbClient.isPg()) {
    console.log("[Production] Initializing PostgreSQL schema verification...");
    await defaultDbClient.ensureSchema().catch((err) => {
      console.warn("[Production] PostgreSQL schema verification notice:", err.message);
    });
  } else {
    console.log("[Production] Running on persistent local storage driver.");
  }

  const server = createUnifiedGatewayServer();
  server.listen(PORT, () => {
    console.log(`\n✓ Raksha protocol host listening on port ${PORT}`);
    if (PUBLIC_WEB_ORIGIN) {
      console.log(`  - Citizen website  : ${PUBLIC_WEB_ORIGIN}`);
    } else {
      console.log(`  - Citizen pages    : http://localhost:${PORT}/ (set PUBLIC_WEB_ORIGIN in production)`);
    }
    console.log(`  - Core API         : http://localhost:${PORT}/v1/process`);
    console.log(`  - CAP API          : http://localhost:${PORT}/cap/actions/execute`);
    console.log(`  - Portal A (1930)  : http://localhost:${PORT}/portal-a`);
    console.log(`  - Portal B (Bank)  : http://localhost:${PORT}/portal-b`);
    console.log(`  - WhatsApp webhook : http://localhost:${PORT}/whatsapp/webhook`);
    console.log(`  - Phone telephony  : http://localhost:${PORT}/phone/simulate`);
    console.log(`  - MCP agent server : http://localhost:${PORT}/mcp`);
    console.log(`  - Health           : http://localhost:${PORT}/health\n`);
  });
}

if (process.argv[1]?.includes("prod-server")) {
  startProductionGateway().catch((err) => {
    console.error("[Fatal Startup Error]:", err);
    process.exit(1);
  });
}
