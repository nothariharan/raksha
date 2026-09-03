/**
 * Production verify helper — two POST /v1/process across identity sync (restart stand-in).
 * Usage:
 *   PROTOCOL_PUBLIC_ORIGIN=https://raksha-protocol.onrender.com pnpm exec tsx scripts/verify-prod-persistence.ts
 * Or against local gateway:
 *   PORT=3000 pnpm exec tsx scripts/verify-prod-persistence.ts
 */

function origin(): string {
  const pub = (process.env.PROTOCOL_PUBLIC_ORIGIN || "").replace(/\/$/, "");
  if (pub) return pub;
  return `http://127.0.0.1:${Number(process.env.PORT) || 3000}`;
}

async function createOnce(base: string, label: string): Promise<string> {
  const res = await fetch(`${base}/v1/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "web",
      modality: "text",
      content: `${label} paid 4100 rupees via PhonePe from SBI with UTR ${Date.now().toString().slice(-12)} after a scam call.`,
      language: "en",
    }),
  });
  if (!res.ok) {
    throw new Error(`POST /v1/process failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { incidentId?: string; incident?: { id?: string }; error?: string };
  const id = body.incidentId || body.incident?.id;
  if (!id) throw new Error(`missing incident id: ${JSON.stringify(body)}`);
  return id;
}

async function main(): Promise<void> {
  const base = origin();
  console.log(`\n▶ verify-prod-persistence against ${base}\n`);

  const first = await createOnce(base, "Verify-A");
  console.log(`  ✓ first create: ${first}`);

  // Stand-in for process restart: hit health (wake), then create again.
  // Real Render restart is operator-driven; allocator sync on boot is what prevents PK collision.
  const health = await fetch(`${base}/health`);
  if (!health.ok) throw new Error(`health failed: ${health.status}`);
  console.log("  ✓ health ok (wake / liveness)");

  const second = await createOnce(base, "Verify-B");
  console.log(`  ✓ second create: ${second}`);

  if (first === second) {
    throw new Error(`duplicate incident id across creates: ${first}`);
  }

  const get1 = await fetch(`${base}/v1/incidents/${first}`);
  const get2 = await fetch(`${base}/v1/incidents/${second}`);
  if (!get1.ok || !get2.ok) {
    throw new Error(`GET by id failed: ${get1.status} / ${get2.status}`);
  }

  console.log("\nPASS  two process creates without duplicate PK\n");
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
