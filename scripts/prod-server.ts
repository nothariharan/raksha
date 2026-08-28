/**
 * Raksha Unified Production Gateway Server
 * Single-origin HTTP router unifying Citizen Web UI, Core API, CAP Engine, Portals A & B,
 * WhatsApp Adapter, Voice Telephony, and MCP Server behind one public HTTPS domain.
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

export function createUnifiedGatewayServer() {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    // 1. Health & Readiness checks for Render / PaaS zero-downtime monitoring
    if (pathname === "/health") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(
        JSON.stringify(
          {
            status: "healthy",
            service: "raksha-unified-gateway",
            version: "0.7.0",
            protocol: "cap/0.1",
            database: defaultDbClient.isPg() ? "postgresql" : "file",
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
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ status: "ready" }));
      return;
    }

    // 2. Route Separation: Human-facing /cap vs backend /api/cap/* & /cap/*
    if (pathname === "/cap" || pathname === "/cap/") {
      handleWebRequest(req, res, { coreUrl: "", capUrl: "" });
      return;
    }

    if (pathname.startsWith("/api/cap") || pathname.startsWith("/cap/")) {
      await handleCapRequest(req, res);
      return;
    }

    // 3. Core API Routes (/v1/*)
    if (pathname.startsWith("/v1/") || pathname === "/v1") {
      await handleCoreRequest(req, res);
      return;
    }

    // 4. Portal A: 1930 Cybercrime Intake (/portal-a/*)
    if (pathname.startsWith("/portal-a")) {
      await handlePortalARequest(req, res);
      return;
    }

    // 5. Portal B: Financial Intermediary Response (/portal-b/*)
    if (pathname.startsWith("/portal-b")) {
      await handlePortalBRequest(req, res);
      return;
    }

    // 6. WhatsApp Webhook (/whatsapp/*)
    if (pathname.startsWith("/whatsapp")) {
      await handleWhatsAppRequest(req, res);
      return;
    }

    // 7. Telephony / Voice Webhook (/phone/*)
    if (pathname.startsWith("/phone")) {
      await handlePhoneRequest(req, res);
      return;
    }

    // 8. Model Context Protocol (/mcp/*)
    if (pathname.startsWith("/mcp")) {
      await handleMcpRequest(req, res);
      return;
    }

    // 9. Citizen Web Application & Static Assets (/, /how, /agents, /app, /demo, /public/*, /images/*)
    handleWebRequest(req, res, { coreUrl: "", capUrl: "" });
  });
}

export async function startProductionGateway(): Promise<void> {
  console.log("==========================================================");
  console.log("  STARTING RAKSHA UNIFIED PRODUCTION GATEWAY");
  console.log("==========================================================");

  // Validate and ensure database tables if running against Postgres
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
    console.log(`\n✓ Raksha Production Gateway listening on port ${PORT}`);
    console.log(`  - Citizen Portal    : http://localhost:${PORT}/`);
    console.log(`  - Citizen Intake    : http://localhost:${PORT}/app`);
    console.log(`  - CAP Spec Page     : http://localhost:${PORT}/cap`);
    console.log(`  - CAP Execution API : http://localhost:${PORT}/api/cap/actions/execute`);
    console.log(`  - Core API Engine   : http://localhost:${PORT}/v1/process`);
    console.log(`  - Portal A (1930)   : http://localhost:${PORT}/portal-a`);
    console.log(`  - Portal B (Bank)   : http://localhost:${PORT}/portal-b`);
    console.log(`  - WhatsApp Webhook  : http://localhost:${PORT}/whatsapp/webhook`);
    console.log(`  - Phone Telephony   : http://localhost:${PORT}/phone/simulate`);
    console.log(`  - MCP Agent Server  : http://localhost:${PORT}/mcp`);
    console.log(`  - Health Endpoint   : http://localhost:${PORT}/health\n`);
  });
}

if (process.argv[1]?.includes("prod-server")) {
  startProductionGateway().catch((err) => {
    console.error("[Fatal Startup Error]:", err);
    process.exit(1);
  });
}
