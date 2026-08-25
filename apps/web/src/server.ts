/**
 * Raksha Web App HTTP Server
 * Serves the citizen emergency interface, developer CAP console, and static brand assets.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderRakshaWebAppHtml } from "./html-template.js";

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

    // Static Assets
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

    if (pathname === "/" || pathname === "/index.html" || pathname === "/app") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderRakshaWebAppHtml({ coreUrl, capUrl }));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  return server;
}
