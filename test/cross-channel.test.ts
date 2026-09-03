/**
 * Cross-Channel Session Continuity — integration tests.
 *
 * Verifies that the same citizen mobile always resolves to the same Core incident,
 * regardless of which channel (Web / Phone / WhatsApp) originated the call, and
 * regardless of service restarts.
 *
 * Run:  FORCE_FILE_DB=true pnpm exec tsx test/cross-channel.test.ts
 */

import assert from "node:assert/strict";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  DatabaseClient,
  IdentityAllocator,
  IncidentRepository,
  IncidentService,
  ProcessService,
} from "@raksha/core";
import { normalizeMobile } from "@raksha/shared";
import { globalEventBus, resetCounters } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "cross-channel");

function uniqueDbPath(label: string): string {
  mkdirSync(ROOT, { recursive: true });
  return join(
    ROOT,
    `raksha-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
  );
}

function wipe(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

async function createIsolatedEnv(dbPath: string) {
  process.env.FORCE_FILE_DB = "true";
  const db = new DatabaseClient(dbPath);
  await db.ensureSchema();
  const ids = new IdentityAllocator(db);
  await ids.syncSequences();
  resetCounters();
  globalEventBus.clear();
  globalEventBus.setIdFactory(() => ids.allocateEventId("EVT"));
  const incidentRepo = new IncidentRepository(db);
  const incidentService = new IncidentService(incidentRepo, undefined, undefined, ids);
  const processService = new ProcessService(incidentService);
  return { db, ids, incidentRepo, incidentService, processService };
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: New citizen (mobile only) → creates RKS-000001
// ─────────────────────────────────────────────────────────────────────────────
async function test1_newMobileCreatesFirstIncident(): Promise<void> {
  const path = uniqueDbPath("t1");
  wipe(path);
  const { processService } = await createIsolatedEnv(path);

  const result = await processService.processInput({
    source: "web",
    modality: "text",
    content: "Someone called pretending to be BSNL and I paid ₹3000.",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });

  assert.ok(result.incidentId, "incidentId must be assigned");
  assert.match(result.incidentId, /^RKS-/, "ID must be in RKS- format");
  console.log(`  ✓ Test 1 — new mobile creates incident: ${result.incidentId}`);
  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Same mobile again (open incident) → same incidentId, not a new one
// ─────────────────────────────────────────────────────────────────────────────
async function test2_sameMobileResumesOpenIncident(): Promise<void> {
  const path = uniqueDbPath("t2");
  wipe(path);
  const { processService } = await createIsolatedEnv(path);

  const first = await processService.processInput({
    source: "web",
    modality: "text",
    content: "Someone called pretending to be BSNL and I paid ₹3000.",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });

  const second = await processService.processInput({
    source: "phone",
    modality: "voice",
    content: "Main ek UPI fraud ki report karna chahta hoon.",
    language: "hi",
    reporter: { mobile: "919876543210" }, // same mobile, different format
  });

  assert.equal(
    first.incidentId,
    second.incidentId,
    `Both calls must resolve to same incident. Got ${first.incidentId} vs ${second.incidentId}`
  );
  console.log(`  ✓ Test 2 — same mobile resumes open incident: ${first.incidentId}`);
  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Different mobile → creates a new (different) incident
// ─────────────────────────────────────────────────────────────────────────────
async function test3_differentMobileCreatesSeparateIncident(): Promise<void> {
  const path = uniqueDbPath("t3");
  wipe(path);
  const { processService } = await createIsolatedEnv(path);

  const first = await processService.processInput({
    source: "web",
    modality: "text",
    content: "Someone called pretending to be BSNL and I paid ₹3000.",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });

  const second = await processService.processInput({
    source: "whatsapp",
    modality: "text",
    content: "Mujhe OTP scam hua hai ₹10,000.",
    language: "hi",
    reporter: { mobile: "+919999999999" }, // different citizen
  });

  assert.notEqual(
    first.incidentId,
    second.incidentId,
    "Different mobiles must produce different incidents"
  );
  console.log(
    `  ✓ Test 3 — different mobile → separate incident: ${first.incidentId} vs ${second.incidentId}`
  );
  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: SUBMITTED incident + same mobile → creates a new incident (fresh case)
// ─────────────────────────────────────────────────────────────────────────────
async function test4_submittedIncidentStartsNewCase(): Promise<void> {
  const path = uniqueDbPath("t4");
  wipe(path);
  const { processService, incidentService, incidentRepo } = await createIsolatedEnv(path);

  // Create first incident and manually close it (SUBMITTED = terminal)
  const first = await processService.processInput({
    source: "web",
    modality: "text",
    content: "Fraud happened with UPI.",
    language: "en",
    reporter: { mobile: "+919876540001" },
  });

  // Force the state to SUBMITTED (terminal)
  await incidentRepo.update(first.incidentId, { state: "SUBMITTED" });

  // Second call with same mobile — should create a new incident
  const second = await processService.processInput({
    source: "phone",
    modality: "voice",
    content: "Second fraud for same person.",
    language: "en",
    reporter: { mobile: "+919876540001" },
  });

  assert.notEqual(
    first.incidentId,
    second.incidentId,
    "A SUBMITTED (terminal) incident must not be resumed; a new one should be created"
  );
  console.log(
    `  ✓ Test 4 — SUBMITTED incident → new case: ${first.incidentId} → ${second.incidentId}`
  );
  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: Web then WhatsApp with same mobile → same incidentId
// ─────────────────────────────────────────────────────────────────────────────
async function test5_webThenWhatsAppSameMobile(): Promise<void> {
  const path = uniqueDbPath("t5");
  wipe(path);
  const { processService } = await createIsolatedEnv(path);

  const webResult = await processService.processInput({
    source: "web",
    modality: "text",
    content: "UPI fraud: I was tricked into paying ₹8,000.",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });

  const waResult = await processService.processInput({
    source: "whatsapp",
    modality: "text",
    content: "Main apni shikayat update karna chahta hoon.",
    language: "hi",
    reporter: { mobile: "whatsapp:+919876543210" }, // WhatsApp prefix
  });

  assert.equal(
    webResult.incidentId,
    waResult.incidentId,
    `Web and WhatsApp must share incident. Got ${webResult.incidentId} vs ${waResult.incidentId}`
  );
  console.log(`  ✓ Test 5 — Web → WhatsApp same incident: ${webResult.incidentId}`);
  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: Web then Phone with same mobile → same incidentId
// ─────────────────────────────────────────────────────────────────────────────
async function test6_webThenPhoneSameMobile(): Promise<void> {
  const path = uniqueDbPath("t6");
  wipe(path);
  const { processService } = await createIsolatedEnv(path);

  const webResult = await processService.processInput({
    source: "web",
    modality: "text",
    content: "Electricity department scam, lost ₹3,000.",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });

  const phoneResult = await processService.processInput({
    source: "phone",
    modality: "voice",
    content: "Mujhe is fraud ke baare mein aur batana hai.",
    language: "hi",
    reporter: { mobile: "09876543210" }, // leading 0 format
  });

  assert.equal(
    webResult.incidentId,
    phoneResult.incidentId,
    `Web and Phone must share incident. Got ${webResult.incidentId} vs ${phoneResult.incidentId}`
  );
  console.log(`  ✓ Test 6 — Web → Phone same incident: ${webResult.incidentId}`);
  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: Restart (new process env / new instance with same DB) → mobile lookup still works
// ─────────────────────────────────────────────────────────────────────────────
async function test7_restartMobileLookupWorks(): Promise<void> {
  const path = uniqueDbPath("t7");
  wipe(path);

  // "Before restart" — create an open incident
  {
    const { processService } = await createIsolatedEnv(path);
    await processService.processInput({
      source: "web",
      modality: "text",
      content: "OTP fraud, I lost ₹15,000.",
      language: "en",
      reporter: { mobile: "+919812345678" },
    });
  }

  // "After restart" — new instance, same DB file, no in-memory session
  {
    const { incidentService } = await createIsolatedEnv(path);
    const open = await incidentService.findOpenByMobile("+919812345678");
    assert.ok(open, "findOpenByMobile must return the incident after a restart");
    assert.match(open!.id, /^RKS-/, "Recovered incident must have an RKS- ID");
    console.log(`  ✓ Test 7 — restart + findOpenByMobile returns: ${open!.id}`);
  }

  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 8: Ownership check — explicit incidentId with wrong mobile → error
// ─────────────────────────────────────────────────────────────────────────────
async function test8_ownershipMismatchThrows(): Promise<void> {
  const path = uniqueDbPath("t8");
  wipe(path);
  const { processService } = await createIsolatedEnv(path);

  // Create incident for mobile A
  const result = await processService.processInput({
    source: "web",
    modality: "text",
    content: "BSNL scam, ₹2,000 lost.",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });

  // Try to access it with mobile B (different citizen)
  await assert.rejects(
    () =>
      processService.processInput({
        incidentId: result.incidentId,
        source: "phone",
        modality: "voice",
        content: "Trying to hijack someone else's case.",
        language: "en",
        reporter: { mobile: "+919999999999" }, // wrong mobile
      }),
    /does not belong to/,
    "Ownership mismatch must throw an error mentioning 'does not belong to'"
  );

  console.log(`  ✓ Test 8 — ownership mismatch correctly rejected`);
  wipe(path);
}

// ─────────────────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────────────────
async function runAll(): Promise<void> {
  mkdirSync(ROOT, { recursive: true });
  console.log("\n====================================================");
  console.log("  Cross-Channel Session Continuity — Test Suite");
  console.log("====================================================\n");

  const tests = [
    test1_newMobileCreatesFirstIncident,
    test2_sameMobileResumesOpenIncident,
    test3_differentMobileCreatesSeparateIncident,
    test4_submittedIncidentStartsNewCase,
    test5_webThenWhatsAppSameMobile,
    test6_webThenPhoneSameMobile,
    test7_restartMobileLookupWorks,
    test8_ownershipMismatchThrows,
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      await t();
      passed++;
    } catch (err: any) {
      console.error(`  ✗ ${t.name}:`, err.message || err);
      failed++;
    }
  }

  console.log(`\n====================================================`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runAll();
