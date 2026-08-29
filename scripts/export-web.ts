/**
 * Pre-render the citizen website to static HTML for Vercel.
 * Protocol APIs stay on Render; /app talks to PROTOCOL_PUBLIC_ORIGIN.
 */

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  renderAgentsPageHtml,
  renderAppPageHtml,
  renderCapPageHtml,
  renderHomePageHtml,
  renderHowPageHtml,
} from "../apps/web/src/html-template.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "apps", "web", "out");
const protocolOrigin = (
  process.env.PROTOCOL_PUBLIC_ORIGIN || "https://raksha-protocol.onrender.com"
).replace(/\/$/, "");

function writePage(routePath: string, html: string): void {
  const file =
    routePath === "/" ? join(outDir, "index.html") : join(outDir, routePath.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html, "utf8");
}

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });

writePage("/", renderHomePageHtml());
writePage("/how", renderHowPageHtml());
writePage("/agents", renderAgentsPageHtml());
writePage("/cap", renderCapPageHtml());
writePage("/app", renderAppPageHtml({ coreUrl: protocolOrigin, capUrl: protocolOrigin }));
writePage("/demo", renderAppPageHtml({ coreUrl: protocolOrigin, capUrl: protocolOrigin }));

const publicDir = join(root, "apps", "web", "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, outDir, { recursive: true });
}

writeFileSync(
  join(outDir, "404.html"),
  `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Not found — Raksha</title>
<meta http-equiv="refresh" content="0;url=/"><link rel="canonical" href="/"></head>
<body><p>Redirecting home.</p></body></html>`,
  "utf8"
);

console.log(`[export-web] Wrote static site to ${outDir}`);
console.log(`[export-web] /app API origin: ${protocolOrigin}`);
