/**
 * Raksha Web App HTTP Server
 * Serves the single-screen editorial hero, dedicated secondary routes, and static brand assets.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import "@raksha/shared"; // load .env.local for ELEVENLABS_* used by signed-url endpoint
import {
  renderHomePageHtml,
  renderHowPageHtml,
  renderAgentsPageHtml,
  renderCapPageHtml,
  renderAppPageHtml,
} from "./html-template.js";

export function handleWebRequest(
  req: IncomingMessage,
  res: ServerResponse,
  config?: { coreUrl?: string; capUrl?: string }
): void {
  const coreUrl = config?.coreUrl !== undefined ? config.coreUrl : (process.env.CORE_BASE_URL || "");
  const capUrl = config?.capUrl !== undefined ? config.capUrl : (process.env.CAP_PUBLIC_BASE_URL || "");
  const elevenLabsAgentId =
    process.env.ELEVENLABS_WEB_AGENT_ID ||
    process.env.ELEVENLABS_INTAKE_AGENT_ID ||
    process.env.ELEVENLABS_AGENT_ID ||
    "";

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "raksha-web", version: "0.7.0" }));
    return;
  }

  // Signed URL for private ElevenLabs ConvAI agents — API key never reaches the browser.
  // Uses ELEVENLABS_INTAKE_AGENT_ID from .env.local (the historical Raksha intake agent).
  if (pathname === "/app/elevenlabs/signed-url" && method === "GET") {
    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    const agentId =
      url.searchParams.get("agentId") ||
      process.env.ELEVENLABS_WEB_AGENT_ID ||
      elevenLabsAgentId;
    if (!apiKey || apiKey.startsWith("synthetic_")) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }));
      return;
    }
    if (!agentId || agentId.includes("synthetic")) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "ELEVENLABS_INTAKE_AGENT_ID not configured (set a real agent id in .env.local)",
        })
      );
      return;
    }

    const signedUrlApi =
      "https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=" +
      encodeURIComponent(agentId);

    fetch(signedUrlApi, { headers: { "xi-api-key": apiKey } })
      .then(async (upstream) => {
        const body = await upstream.text();
        res.writeHead(upstream.status, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(body);
      })
      .catch((err) => {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message || "ElevenLabs signed URL failed" }));
      });
    return;
  }

  // Conversation token (WebRTC) — required for reliable browser playback.
  // Signed WebSocket + ulaw telephony formats were why citizens heard silence.
  if (pathname === "/app/elevenlabs/conversation-token" && method === "GET") {
    const apiKey = process.env.ELEVENLABS_API_KEY || "";
    const agentId =
      url.searchParams.get("agentId") ||
      process.env.ELEVENLABS_WEB_AGENT_ID ||
      elevenLabsAgentId;
    if (!apiKey || apiKey.startsWith("synthetic_")) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }));
      return;
    }
    if (!agentId || agentId.includes("synthetic")) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "ELEVENLABS_INTAKE_AGENT_ID not configured" }));
      return;
    }

    const tokenApi =
      "https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=" +
      encodeURIComponent(agentId);

    fetch(tokenApi, { headers: { "xi-api-key": apiKey } })
      .then(async (upstream) => {
        const body = await upstream.text();
        res.writeHead(upstream.status, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(body);
      })
      .catch((err) => {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: (err as Error).message || "ElevenLabs conversation token failed" })
        );
      });
    return;
  }

  if (pathname === "/app/elevenlabs/config" && method === "GET") {
    const resolved =
      process.env.ELEVENLABS_WEB_AGENT_ID ||
      elevenLabsAgentId;
    const live =
      resolved && !resolved.includes("synthetic") ? resolved : null;
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(
      JSON.stringify({
        agentId: live,
        signedUrlPath: "/app/elevenlabs/signed-url",
        conversationTokenPath: "/app/elevenlabs/conversation-token",
        source: live
          ? process.env.ELEVENLABS_WEB_AGENT_ID
            ? "ELEVENLABS_WEB_AGENT_ID"
            : "ELEVENLABS_INTAKE_AGENT_ID"
          : null,
      })
    );
    return;
  }

    // Static Assets (/images/* or /public/*)
    if (pathname.startsWith("/images/") || pathname.startsWith("/public/")) {
      // Strip the URL-root slash before joining. On Windows, joining an absolute
      // child path can discard the public directory and turn valid assets into 404s.
      const cleanPath = pathname.replace(/^\/(?:public\/)?/, "");
      // `pnpm --filter @raksha/web dev` runs with apps/web as cwd, while the
      // full demo launcher runs from the repository root. Support both paths.
      const appPublicPath = join(process.cwd(), "public", cleanPath);
      const workspacePublicPath = join(process.cwd(), "apps", "web", "public", cleanPath);
      const fullPath = existsSync(appPublicPath) ? appPublicPath : workspacePublicPath;
      if (existsSync(fullPath)) {
        const ext = cleanPath.split(".").pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          svg: "image/svg+xml",
          webp: "image/webp",
        };
        res.writeHead(200, {
          "Content-Type": mimeTypes[ext || "png"] || "application/octet-stream",
          "Cache-Control": "public, max-age=86400",
        });
        res.end(readFileSync(fullPath));
        return;
      }
    }

    // Route: / (Single-Screen Editorial Hero)
    if (pathname === "/" || pathname === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderHomePageHtml());
      return;
    }

    // Route: /how (How Raksha Works)
    if (pathname === "/how") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderHowPageHtml());
      return;
    }

    // Route: /agents (For AI Agents & MCP)
    if (pathname === "/agents") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderAgentsPageHtml());
      return;
    }

    // Route: /cap (Civic Action Protocol Spec)
    if (pathname === "/cap") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderCapPageHtml());
      return;
    }

    // Route: /app or /demo (Interactive Citizen Console)
    if (pathname === "/app" || pathname === "/demo") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        renderAppPageHtml({
          coreUrl,
          capUrl,
          portalAUrl: process.env.PORTAL_A_BASE_URL || "http://localhost:3003",
          portalBUrl: process.env.PORTAL_B_BASE_URL || "http://localhost:3004",
          whatsappNumber: process.env.WHATSAPP_SANDBOX_NUMBER || "+14155238886",
          whatsappJoin: process.env.WHATSAPP_SANDBOX_JOIN || "join milk-work",
          elevenLabsAgentId:
            elevenLabsAgentId && !elevenLabsAgentId.includes("synthetic")
              ? elevenLabsAgentId
              : "",
        })
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
}

export function createWebServer(config?: { coreUrl?: string; capUrl?: string }) {
  return createServer((req, res) => handleWebRequest(req, res, config));
}
