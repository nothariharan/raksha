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

export function handleWebRequest(
  req: IncomingMessage,
  res: ServerResponse,
  config?: { coreUrl?: string; capUrl?: string }
): void {
  const coreUrl = config?.coreUrl !== undefined ? config.coreUrl : (process.env.CORE_BASE_URL || "");
  const capUrl = config?.capUrl !== undefined ? config.capUrl : (process.env.CAP_PUBLIC_BASE_URL || "");

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "raksha-web", version: "0.7.0" }));
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
      res.end(renderAppPageHtml({ coreUrl, capUrl }));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
}

export function createWebServer(config?: { coreUrl?: string; capUrl?: string }) {
  return createServer((req, res) => handleWebRequest(req, res, config));
}
