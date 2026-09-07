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

// Same-origin on Vercel so /v1 and /app/elevenlabs use vercel.json rewrites.
// Avoids browsers/ad-blockers blocking direct *.onrender.com fetches (ERR_BLOCKED_BY_CLIENT).
const sameOriginApi = process.env.VERCEL === "1" || process.env.RAKSHA_SAME_ORIGIN_API === "1";
const apiOrigin = sameOriginApi ? "" : protocolOrigin;

const elevenLabsAgentId =
  process.env.ELEVENLABS_WEB_AGENT_ID ||
  process.env.ELEVENLABS_INTAKE_AGENT_ID ||
  process.env.ELEVENLABS_AGENT_ID ||
  "";
const liveAgentId =
  elevenLabsAgentId && !elevenLabsAgentId.includes("synthetic") ? elevenLabsAgentId : "";

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
const whatsappPilot = {
  whatsappNumber: process.env.WHATSAPP_SANDBOX_NUMBER || "+14155238886",
  whatsappJoin: process.env.WHATSAPP_SANDBOX_JOIN || "join milk-work",
};
writePage("/app", renderAppPageHtml({
  coreUrl: apiOrigin,
  capUrl: apiOrigin,
  elevenLabsAgentId: liveAgentId,
  portalAUrl: process.env.PORTAL_A_BASE_URL || `${protocolOrigin}/portal-a`,
  portalBUrl: process.env.PORTAL_B_BASE_URL || `${protocolOrigin}/portal-b`,
  ...whatsappPilot,
}));
writePage("/demo", renderAppPageHtml({
  coreUrl: apiOrigin,
  capUrl: apiOrigin,
  elevenLabsAgentId: liveAgentId,
  portalAUrl: process.env.PORTAL_A_BASE_URL || `${protocolOrigin}/portal-a`,
  portalBUrl: process.env.PORTAL_B_BASE_URL || `${protocolOrigin}/portal-b`,
  ...whatsappPilot,
}));

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
console.log(`[export-web] /app API origin: ${apiOrigin || "(same-origin / Vercel rewrites)"}`);
console.log(`[export-web] ElevenLabs agent baked: ${liveAgentId ? liveAgentId.slice(0, 12) + "…" : "(none)"}`);
