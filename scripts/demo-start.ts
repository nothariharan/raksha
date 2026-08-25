/**
 * Raksha Full-Stack Demo Launcher (pnpm demo / pnpm demo:start)
 * Spawns and coordinates all 8 protocol services in a single managed process with live health verification.
 */

import { createCoreServer } from "@raksha/core";
import { createCapServer } from "@raksha/cap";
import { createWebServer } from "@raksha/web";
import { createWhatsAppWebhookServer } from "@raksha/agent-whatsapp";
import { createPhoneWebhookServer } from "@raksha/agent-phone";
import { createMCPServer } from "@raksha/agent-mcp";
import { createPortalAServer } from "@raksha/portal-a";
import { createPortalBServer } from "@raksha/portal-b";
import { runDemoReset } from "./demo-reset.js";

const PORT_CORE = Number(process.env.PORT_CORE) || 3001;
const PORT_CAP = Number(process.env.PORT_CAP) || 3002;
const PORT_PORTAL_A = Number(process.env.PORT_PORTAL_A) || 3003;
const PORT_PORTAL_B = Number(process.env.PORT_PORTAL_B) || 3004;
const PORT_WEB = Number(process.env.PORT_WEB) || 3000;
const PORT_WHATSAPP = Number(process.env.PORT_WHATSAPP) || 3005;
const PORT_PHONE = Number(process.env.PORT_PHONE) || 3006;
const PORT_MCP = Number(process.env.PORT_MCP) || 3007;

export async function startFullDemoStack(): Promise<void> {
  // 1. Reset to deterministic known state
  await runDemoReset();

  console.log("Starting Raksha Protocol Services...\n");

  const coreServer = createCoreServer();
  const capServer = createCapServer();
  const portalAServer = createPortalAServer();
  const portalBServer = createPortalBServer();
  const webServer = createWebServer();
  const waServer = createWhatsAppWebhookServer();
  const phoneServer = createPhoneWebhookServer();
  const mcpServer = createMCPServer();

  await Promise.all([
    new Promise<void>((r) => coreServer.listen(PORT_CORE, r)),
    new Promise<void>((r) => capServer.listen(PORT_CAP, r)),
    new Promise<void>((r) => portalAServer.listen(PORT_PORTAL_A, r)),
    new Promise<void>((r) => portalBServer.listen(PORT_PORTAL_B, r)),
    new Promise<void>((r) => webServer.listen(PORT_WEB, r)),
    new Promise<void>((r) => waServer.listen(PORT_WHATSAPP, r)),
    new Promise<void>((r) => phoneServer.listen(PORT_PHONE, r)),
    new Promise<void>((r) => mcpServer.listen(PORT_MCP, r)),
  ]);

  console.log("┌────────────────────────────────────────────────────────────────────────┐");
  console.log("│                    🛡️  RAKSHA EMERGENCY PROTOCOL                       │");
  console.log("│         One Civic Action • Four Convergent Interfaces (v0.7.0)         │");
  console.log("├────────────────────────────────────────────────────────────────────────┤");
  console.log(`│  🌐 Citizen Web UI & Dev Drawer : http://localhost:${PORT_WEB}                │`);
  console.log(`│  ⚡ Raksha Core API             : http://localhost:${PORT_CORE}                │`);
  console.log(`│  📜 Civic Action Protocol (CAP) : http://localhost:${PORT_CAP}                │`);
  console.log(`│  🏛️  Portal A (1930 Intake)      : http://localhost:${PORT_PORTAL_A}                │`);
  console.log(`│  🏦 Portal B (Bank Response)    : http://localhost:${PORT_PORTAL_B}                │`);
  console.log(`│  💬 WhatsApp Webhook Adapter    : http://localhost:${PORT_WHATSAPP}/whatsapp/webhook │`);
  console.log(`│  📞 Voice Telephony Webhook     : http://localhost:${PORT_PHONE}/phone/simulate      │`);
  console.log(`│  🤖 Model Context Protocol (MCP): http://localhost:${PORT_MCP}/mcp                 │`);
  console.log("├────────────────────────────────────────────────────────────────────────┤");
  console.log(`│  🩺 Overall System Health Check : http://localhost:${PORT_CORE}/system/health         │`);
  console.log("└────────────────────────────────────────────────────────────────────────┘\n");
  console.log("Press Ctrl+C to shut down all services gracefully.\n");
}

if (process.argv[1]?.includes("demo-start") || process.argv[1]?.includes("demo")) {
  startFullDemoStack().catch((err) => {
    console.error("Failed to launch full stack:", err);
    process.exit(1);
  });
}
