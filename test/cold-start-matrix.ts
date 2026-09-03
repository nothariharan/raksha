/**
 * Cold-start matrix — A clean boot, B reload GET, C file reload, D restart allocate, E concurrent.
 * Run via: pnpm test:persistence
 */

import assert from "node:assert/strict";
import { existsSync, unlinkSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DatabaseClient,
  IdentityAllocator,
  IncidentRepository,
  IncidentService,
} from "@raksha/core";
import { globalEventBus, resetCounters } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "cold-start-matrix");

function uniquePath(label: string): string {
  return join(ROOT, `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

async function boot(path: string) {
  process.env.FORCE_FILE_DB = "true";
  const db = new DatabaseClient(path);
  await db.ensureSchema();
  const ids = new IdentityAllocator(db);
  await ids.syncSequences();
  globalEventBus.setIdFactory(() => ids.allocateEventId("EVT"));
  const incidents = new IncidentRepository(db);
  const service = new IncidentService(incidents, undefined, undefined, ids);
  return { db, ids, incidents, service };
}

async function matrixA(): Promise<void> {
  const path = uniquePath("A");
  if (existsSync(path)) unlinkSync(path);
  resetCounters();
  globalEventBus.clear();
  const ctx = await boot(path);
  const inc = await ctx.service.createIncident({
    narrative: { text: "Clean boot fraud report ₹3000 UPI" },
    source: "web",
    transaction: { amount: 3000, currency: "INR", channel: "UPI" },
  });
  assert.equal(inc.id, "RKS-000001");
  console.log(`  ✓ A clean boot + create → ${inc.id}`);
  await ctx.db.close();
  unlinkSync(path);
}

async function matrixB(): Promise<void> {
  const path = uniquePath("B");
  if (existsSync(path)) unlinkSync(path);
  resetCounters();
  globalEventBus.clear();
  const first = await boot(path);
  const created = await first.service.createIncident({
    narrative: { text: "Case for reload GET" },
    source: "web",
  });
  await first.db.close();

  const second = await boot(path);
  const got = await second.incidents.findById(created.id);
  assert.ok(got);
  assert.equal(got!.id, created.id);
  console.log(`  ✓ B create → new client → GET ${created.id}`);
  await second.db.close();
  unlinkSync(path);
}

async function matrixC(): Promise<void> {
  const path = uniquePath("C");
  if (existsSync(path)) unlinkSync(path);
  resetCounters();
  globalEventBus.clear();
  const first = await boot(path);
  const created = await first.service.createIncident({
    narrative: { text: "File reload stand-in for DB restart" },
    source: "web",
  });
  first.db.persistToDisk();
  const raw = readFileSync(path, "utf-8");
  assert.ok(raw.includes(created.id));

  first.db.reloadFromDisk();
  const got = await first.incidents.findById(created.id);
  assert.equal(got?.id, created.id);
  console.log(`  ✓ C file write → reload → GET ${created.id}`);
  await first.db.close();
  unlinkSync(path);
}

async function matrixD(): Promise<void> {
  const path = uniquePath("D");
  if (existsSync(path)) unlinkSync(path);
  resetCounters();
  globalEventBus.clear();
  const first = await boot(path);
  const a = await first.service.createIncident({
    narrative: { text: "Before restart" },
    source: "web",
  });
  await first.db.close();

  const second = await boot(path);
  const b = await second.service.createIncident({
    narrative: { text: "After restart" },
    source: "web",
  });
  assert.notEqual(a.id, b.id);
  assert.equal(b.id, "RKS-000002");
  console.log(`  ✓ D second incident after restart ${a.id} → ${b.id}`);
  await second.db.close();
  unlinkSync(path);
}

async function matrixE(): Promise<void> {
  const path = uniquePath("E");
  if (existsSync(path)) unlinkSync(path);
  resetCounters();
  globalEventBus.clear();
  const ctx = await boot(path);
  const batch = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      ctx.service.createIncident({
        narrative: { text: `Concurrent cold ${i}` },
        source: "web",
      })
    )
  );
  const ids = batch.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  console.log(`  ✓ E concurrent ${ids.length} unique`);
  await ctx.db.close();
  unlinkSync(path);
}

async function main(): Promise<void> {
  mkdirSync(ROOT, { recursive: true });
  console.log("\n▶ Cold-start matrix\n");
  await matrixA();
  await matrixB();
  await matrixC();
  await matrixD();
  await matrixE();
  console.log("\n✓ cold-start matrix passed\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
