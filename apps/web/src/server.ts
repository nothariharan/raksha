/**
 * Raksha Web App HTTP Server
 * Serves the single-screen editorial hero, dedicated secondary routes, and static brand assets.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  renderHomePageHtml,
  renderHowPageHtml,
  renderAgentsPageHtml,
  renderCapPageHtml,
  renderAppPageHtml,
} from "./html-template.js";

export function createWebServer(config?: { coreUrl?: string; capUrl?: string }) {
  const coreUrl = config?.coreUrl || process.env.CORE_BASE_URL || "http://localhost:3001";
  const capUrl = config?.capUrl || process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    if (pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "raksha-web", version: "0.7.0" }));
      return;
    }

    // Static Assets (/images/* or /public/*)
    if (pathname.startsWith("/images/") || pathname.startsWith("/public/")) {
      const cleanPath = pathname.replace(/^\/public/, "");
      const fullPath = join(process.cwd(), "apps", "web", "public", cleanPath);
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
      res.end(renderAppPageHtml({ coreUrl, capUrl }));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  return server;
}
