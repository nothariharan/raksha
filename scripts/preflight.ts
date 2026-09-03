/**
 * pnpm preflight — hard checks against local PORT or PROTOCOL_PUBLIC_ORIGIN.
 * Exit 1 on hard fail. Live Twilio/ElevenLabs: warn unless REQUIRE_LIVE_CHANNELS=true.
 */

import { existsSync, accessSync, constants } from "node:fs";
import { join } from "node:path";
import {
  defaultDbClient,
  defaultIdentityAllocator,
  IdentityAllocator,
} from "@raksha/core";

type CheckResult = { name: string; ok: boolean; detail: string; hard: boolean };

function baseOrigin(): string {
  const publicOrigin = (process.env.PROTOCOL_PUBLIC_ORIGIN || "").replace(/\/$/, "");
  if (publicOrigin) return publicOrigin;
  const port = Number(process.env.PORT) || 3000;
  return `http://127.0.0.1:${port}`;
}

function isLocalhost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return true;
  }
}

async function checkDb(): Promise<CheckResult> {
  try {
    if (defaultDbClient.isPg()) {
      const pool = defaultDbClient.getPool();
      if (!pool) return { name: "database", ok: false, detail: "pool missing", hard: true };
      await pool.query("SELECT 1");
      return { name: "database", ok: true, detail: "postgresql reachable", hard: true };
    }
    const path = join(process.cwd(), ".data", "raksha-db.json");
    const dir = join(process.cwd(), ".data");
    if (!existsSync(dir)) {
      return { name: "database", ok: false, detail: `.data missing at ${dir}`, hard: true };
    }
    accessSync(dir, constants.W_OK);
    return {
      name: "database",
      ok: true,
      detail: existsSync(path) ? `file store ${path}` : `writable dir ${dir} (file will be created)`,
      hard: true,
    };
  } catch (err) {
    return { name: "database", ok: false, detail: (err as Error).message, hard: true };
  }
}

async function checkSequences(): Promise<CheckResult> {
  try {
    await defaultDbClient.ensureSchema();
    const ids = new IdentityAllocator(defaultDbClient);
    await ids.syncSequences();
    const next = await ids.peekNextIncidentNumber();
    // next must be > max existing; peek returns next allocate value
    if (!Number.isFinite(next) || next < 1) {
      return { name: "sequences", ok: false, detail: `invalid next=${next}`, hard: true };
    }
    return { name: "sequences", ok: true, detail: `next incident number ${next}`, hard: true };
  } catch (err) {
    return { name: "sequences", ok: false, detail: (err as Error).message, hard: true };
  }
}

async function checkHttp(
  name: string,
  url: string,
  init?: RequestInit,
  assertFn?: (res: Response, body: unknown) => string | null
): Promise<CheckResult> {
  try {
    const res = await fetch(url, init);
    let body: unknown = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    if (!res.ok) {
      return { name, ok: false, detail: `HTTP ${res.status} ${url}`, hard: true };
    }
    if (assertFn) {
      const err = assertFn(res, body);
      if (err) return { name, ok: false, detail: err, hard: true };
    }
    return { name, ok: true, detail: `HTTP ${res.status} ${url}`, hard: true };
  } catch (err) {
    return { name, ok: false, detail: `${url} — ${(err as Error).message}`, hard: true };
  }
}

function checkChannels(): CheckResult[] {
  const requireLive = /^(1|true|yes)$/i.test(String(process.env.REQUIRE_LIVE_CHANNELS ?? ""));
  const results: CheckResult[] = [];

  const eleven = process.env.ELEVENLABS_API_KEY || "";
  const elevenOk = Boolean(eleven) && !eleven.startsWith("synthetic");
  results.push({
    name: "elevenlabs",
    ok: elevenOk,
    detail: elevenOk ? "ELEVENLABS_API_KEY set" : "missing or synthetic_*",
    hard: requireLive,
  });

  const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
  const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
  const twilioOk =
    Boolean(twilioSid) &&
    Boolean(twilioToken) &&
    !twilioSid.startsWith("synthetic") &&
    !twilioToken.startsWith("synthetic");
  results.push({
    name: "twilio",
    ok: twilioOk,
    detail: twilioOk ? "Twilio creds set" : "missing or synthetic_*",
    hard: requireLive,
  });

  return results;
}

async function main(): Promise<void> {
  const origin = baseOrigin();
  console.log("\n==========================================================");
  console.log("  RAKSHA PREFLIGHT");
  console.log(`  Target: ${origin}`);
  console.log("==========================================================\n");

  const results: CheckResult[] = [];

  results.push(await checkDb());
  results.push(await checkSequences());

  results.push(
    await checkHttp("health", `${origin}/health`, undefined, (_r, body) => {
      const b = body as { status?: string };
      if (b?.status !== "healthy" && b?.status !== "ok") {
        return `unexpected health status: ${JSON.stringify(b)}`;
      }
      return null;
    })
  );

  results.push(
    await checkHttp("cap-capabilities", `${origin}/api/cap/capabilities`, undefined, (_r, body) => {
      const b = body as { protocol?: string };
      if (b?.protocol !== "cap/0.1") return "CAP protocol missing";
      return null;
    })
  );

  let createdId = "";
  results.push(
    await checkHttp(
      "v1-process-create",
      `${origin}/v1/process`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "web",
          modality: "text",
          content:
            "Preflight paid 2500 rupees via PhonePe from HDFC Bank with UTR 998877665544 after a phishing call.",
          language: "en",
        }),
      },
      (_r, body) => {
        const b = body as { incidentId?: string; incident?: { id?: string } };
        createdId = b.incidentId || b.incident?.id || "";
        if (!createdId) return "process response missing incidentId";
        return null;
      }
    )
  );

  if (createdId) {
    results.push(
      await checkHttp("v1-process-get", `${origin}/v1/incidents/${createdId}`, undefined, (_r, body) => {
        const b = body as { id?: string; incident?: { id?: string } };
        const id = b.id || b.incident?.id;
        if (id !== createdId) return `GET mismatch got=${id} want=${createdId}`;
        return null;
      })
    );
  } else {
    results.push({
      name: "v1-process-get",
      ok: false,
      detail: "skipped — create failed",
      hard: true,
    });
  }

  results.push(await checkHttp("portal-a", `${origin}/portal-a`));
  results.push(await checkHttp("portal-b", `${origin}/portal-b`));

  results.push(
    await checkHttp(
      "mcp-tools",
      `${origin}/mcp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
      },
      (_r, body) => {
        const b = body as { result?: { tools?: unknown[] } };
        if (!Array.isArray(b?.result?.tools)) return "mcp tools/list missing tools";
        return null;
      }
    )
  );

  // Production origin honesty
  const isProdLike = Boolean(process.env.RENDER || process.env.VERCEL || process.env.NODE_ENV === "production");
  if (isProdLike || process.env.PROTOCOL_PUBLIC_ORIGIN) {
    const pub = process.env.PROTOCOL_PUBLIC_ORIGIN || origin;
    const localhostFail = isLocalhost(pub);
    results.push({
      name: "protocol-origin",
      ok: !localhostFail,
      detail: localhostFail
        ? `PROTOCOL_PUBLIC_ORIGIN must not be localhost in production (got ${pub})`
        : pub,
      hard: Boolean(process.env.RENDER) || process.env.NODE_ENV === "production",
    });

    const web = process.env.PUBLIC_WEB_ORIGIN || "";
    results.push({
      name: "public-web-origin",
      ok: Boolean(web),
      detail: web || "PUBLIC_WEB_ORIGIN unset (gateway page redirects disabled)",
      hard: Boolean(process.env.RENDER),
    });
  }

  results.push(...checkChannels());

  let hardFail = false;
  for (const r of results) {
    const mark = r.ok ? "PASS" : r.hard ? "FAIL" : "WARN";
    if (!r.ok && r.hard) hardFail = true;
    console.log(`  [${mark}] ${r.name}: ${r.detail}`);
  }

  console.log("\n==========================================================");
  if (hardFail) {
    console.log("  PREFLIGHT FAILED");
    console.log("==========================================================\n");
    process.exit(1);
  }
  console.log("  PREFLIGHT PASSED");
  console.log("==========================================================\n");

  // silence unused import if tree-shaken oddly
  void defaultIdentityAllocator;
}

main().catch((err) => {
  console.error("Preflight crashed:", err);
  process.exit(1);
});
