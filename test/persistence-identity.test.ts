/**
 * Persistence identity tests — collision-safe IDs across restart / concurrent creates.
 * Run: FORCE_FILE_DB=true pnpm exec tsx test/persistence-identity.test.ts
 */

import assert from "node:assert/strict";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  DatabaseClient,
  IdentityAllocator,
  IncidentRepository,
  IncidentService,
} from "@raksha/core";
import { globalEventBus, resetCounters } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "persistence-identity");

function uniqueDbPath(label: string): string {
  return join(ROOT, `raksha-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

function wipe(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

async function createIsolatedService(dbPath: string): Promise<{
  db: DatabaseClient;
  ids: IdentityAllocator;
  service: IncidentService;
  incidents: IncidentRepository;
}> {
  process.env.FORCE_FILE_DB = "true";
  const db = new DatabaseClient(dbPath);
  await db.ensureSchema();
  const ids = new IdentityAllocator(db);
  await ids.syncSequences();
  globalEventBus.setIdFactory(() => ids.allocateEventId("EVT"));
  const incidents = new IncidentRepository(db);
  const service = new IncidentService(incidents, undefined, undefined, ids);
  return { db, ids, service, incidents };
}

async function testA_restartPreservesAndAllocatesNext(): Promise<void> {
  const path = uniqueDbPath("A");
  wipe(path);
  resetCounters();
  globalEventBus.clear();

  const first = await createIsolatedService(path);
  const a = await first.service.createIncident({
    narrative: { text: "Lost ₹5000 via UPI scam" },
    source: "web",
    transaction: { amount: 5000, currency: "INR", channel: "UPI" },
  });
  assert.match(a.id, /^RKS-\d{6}$/);
  await first.db.close();

  // Simulate process restart: new client on same file
  const second = await createIsolatedService(path);
  const loaded = await second.incidents.findById(a.id);
  assert.ok(loaded, "first incident still readable after restart");
  assert.equal(loaded!.id, a.id);

  const b = await second.service.createIncident({
    narrative: { text: "Second report after restart" },
    source: "web",
    transaction: { amount: 1000, currency: "INR", channel: "UPI" },
  });
  assert.notEqual(a.id, b.id, "ids must differ across restart");
  assert.match(b.id, /^RKS-\d{6}$/);
  console.log(`  ✓ A restart: ${a.id} → ${b.id}, first row intact`);
  wipe(path);
}

async function testD_sequentialRestartNoDuplicate(): Promise<void> {
  const path = uniqueDbPath("D");
  wipe(path);
  resetCounters();
  globalEventBus.clear();

  let lastId = "";
  for (let i = 0; i < 3; i++) {
    const ctx = await createIsolatedService(path);
    const inc = await ctx.service.createIncident({
      narrative: { text: `Sequential create ${i}` },
      source: "web",
    });
    assert.notEqual(inc.id, lastId);
    lastId = inc.id;
    await ctx.db.close();
  }
  console.log(`  ✓ D create→restart×3 ended at ${lastId}`);
  wipe(path);
}

async function testE_concurrentUnique(): Promise<void> {
  const path = uniqueDbPath("E");
  wipe(path);
  resetCounters();
  globalEventBus.clear();

  const ctx = await createIsolatedService(path);
  const results = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      ctx.service.createIncident({
        narrative: { text: `Concurrent ${i}` },
        source: "web",
      })
    )
  );
  const ids = results.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "concurrent creates must yield unique ids");
  console.log(`  ✓ E concurrent: ${ids.length} unique ids`);
  wipe(path);
}

async function testDemoResetSeedThenNext(): Promise<void> {
  const path = uniqueDbPath("demo");
  wipe(path);
  resetCounters();
  globalEventBus.clear();

  const ctx = await createIsolatedService(path);
  // Seed RKS-000001 like demo-reset
  await ctx.incidents.create({
    id: "RKS-000001",
    protocolVersion: "raksha/0.1",
    type: "FINANCIAL_CYBER_FRAUD",
    narrative: { text: "seed", source: "web" },
    reporter: {},
    transaction: { currency: "INR", channel: "UPI" },
    evidence: [],
    state: "INTAKE",
    validation: { status: "PENDING", missingFields: [], conflicts: [] },
    handoff: { target: "portal-a", status: "NOT_STARTED" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any);
  await ctx.ids.syncSequences();

  const next = await ctx.ids.allocateIncidentId("RKS");
  assert.equal(next, "RKS-000002");
  console.log(`  ✓ demo-reset seed RKS-000001 → next ${next}`);
  wipe(path);
}

async function testPostgresOptional(): Promise<void> {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (!url || url.includes("postgres:postgres@localhost")) {
    console.log("  ⊘ Postgres extra test skipped (DATABASE_URL unset / local placeholder)");
    return;
  }

  delete process.env.FORCE_FILE_DB;
  const db1 = new DatabaseClient();
  if (!db1.isPg()) {
    console.log("  ⊘ Postgres extra test skipped (client fell back to file)");
    return;
  }
  await db1.ensureSchema();
  const ids1 = new IdentityAllocator(db1);
  await ids1.syncSequences();
  const a = await ids1.allocateIncidentId("RKS");

  const ids2 = new IdentityAllocator(db1);
  await ids2.syncSequences();
  const b = await ids2.allocateIncidentId("RKS");
  assert.notEqual(a, b);
  console.log(`  ✓ Postgres allocate across allocator instances: ${a} → ${b}`);
  await db1.close();
}

async function main(): Promise<void> {
  mkdirSync(ROOT, { recursive: true });
  console.log("\n▶ Persistence identity matrix\n");
  await testA_restartPreservesAndAllocatesNext();
  await testD_sequentialRestartNoDuplicate();
  await testE_concurrentUnique();
  await testDemoResetSeedThenNext();
  await testPostgresOptional();
  console.log("\n✓ persistence-identity tests passed\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
