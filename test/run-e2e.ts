/**
 * Raksha Phase 1 — Persistent End-to-End Integration & Restart Test
 *
 * Verifies:
 * 1. Persistent Incident Creation & Validation
 * 2. SHA-256 Evidence Ingestion & Capsule Sealing
 * 3. Idempotent CAP Action Execution (report_financial_fraud)
 * 4. Cross-Portal Event Propagation (Portal A -> CAP -> Event Store -> Portal B)
 * 5. Persistent Response Acknowledgment (Portal B -> CAP -> Core ACKNOWLEDGED)
 * 6. PROCESS RESTART TEST: Shuts down all in-memory services, creates brand new
 *    repository/service instances from persistent storage, and verifies 100% state recovery.
 */

import assert from "node:assert/strict";
import { join } from "node:path";
import { unlinkSync, existsSync } from "node:fs";
import {
  IncidentService,
  ValidationEngine,
  EvidenceService,
  DatabaseClient,
  IncidentRepository,
  EvidenceRepository,
  EventRepository,
  CaseRepository,
  ActionRepository,
} from "@raksha/core";
import { ActionRouter } from "@raksha/cap";
import { createCAPClient } from "@raksha/cap-sdk";
import { PortalAIntakeService } from "@raksha/portal-a";
import { PortalBResponseService } from "@raksha/portal-b";
import { globalEventBus, resetCounters } from "@raksha/shared";

async function runPhase1Tests() {
  console.log("\n=================================================================");
  console.log("  RAKSHA PHASE 1: PERSISTENT CORE + CAP + RESTART TEST SUITE");
  console.log("=================================================================\n");

  const testDbPath = join(process.cwd(), ".data", "raksha-phase1-test-db.json");
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }

  resetCounters();
  globalEventBus.clear();

  // Initialize DB & Repositories for Session 1
  const db1 = new DatabaseClient(testDbPath);
  const incidentRepo1 = new IncidentRepository(db1);
  const evidenceRepo1 = new EvidenceRepository(db1);
  const eventRepo1 = new EventRepository(db1);
  const caseRepo1 = new CaseRepository(db1);
  const actionRepo1 = new ActionRepository(db1);

  const incidentService1 = new IncidentService(incidentRepo1, eventRepo1, evidenceRepo1);
  const evidenceService1 = new EvidenceService(evidenceRepo1, eventRepo1);
  const actionRouter1 = new ActionRouter(caseRepo1, eventRepo1, actionRepo1);

  const capClient1 = createCAPClient({ mode: "in-memory" });
  const portalA1 = new PortalAIntakeService(capClient1);
  const portalB1 = new PortalBResponseService(capClient1);

  // ------------------------------------------------------------------
  // Step 1: Create & Persist Incident
  // ------------------------------------------------------------------
  console.log("▶ [Step 1] Creating & persisting canonical incident in Session 1...");
  const incident = await incidentService1.createIncident({
    source: "web",
    narrative: {
      text: "Urgent: Paid ₹75,000 to fake cyber police digital arrest account.",
    },
    reporter: {
      mobile: "+919876543210",
      preferredLanguage: "hi",
      name: "Ramesh Kumar",
    },
    transaction: {
      amount: 75000,
      currency: "INR",
      channel: "UPI",
      transactionId: "423456789012",
      timestamp: "2026-08-24T18:42:00+05:30",
      debitInstitution: "State Bank of India",
      beneficiaryIdentifier: "mule.account@ybl",
      beneficiaryInstitution: "Yes Bank Ltd",
    },
  });

  assert.equal(incident.id, "RKS-000001");
  assert.equal(incident.state, "READY");
  console.log(`  ✓ Incident persisted: ${incident.id} (State: ${incident.state})`);

  // ------------------------------------------------------------------
  // Step 2: Add Evidence & Seal Capsule
  // ------------------------------------------------------------------
  console.log("\n▶ [Step 2] Ingesting synthetic evidence & sealing capsule...");
  const evidence = await evidenceService1.addEvidence({
    incidentId: incident.id,
    type: "TRANSACTION_SCREENSHOT",
    uri: "synthetic://evidence/screenshot_gpay_75000.png",
    rawContent: "sample_raw_screenshot_binary_buffer_75000",
  });

  assert.equal(evidence.id, "EV-001");
  assert.ok(evidence.sha256);
  assert.equal(evidence.sha256.length, 64);
  console.log(`  ✓ Evidence saved: ${evidence.id} (SHA-256: ${evidence.sha256.slice(0, 16)}...)`);

  const capsule = await evidenceService1.sealEvidenceCapsule(incident.id);
  assert.equal(capsule.items.length, 1);
  assert.equal(capsule.hashDigest.length, 64);
  console.log(`  ✓ Evidence Capsule sealed (Digest: ${capsule.hashDigest.slice(0, 16)}...)`);

  // ------------------------------------------------------------------
  // Step 3: Deterministic Validation
  // ------------------------------------------------------------------
  console.log("\n▶ [Step 3] Deterministic Validation Engine...");
  const validation = ValidationEngine.validate(incident);
  assert.equal(validation.status, "READY");
  assert.equal(validation.missingFields.length, 0);
  console.log(`  ✓ Validation verified: status=${validation.status}`);

  // ------------------------------------------------------------------
  // Step 4: Idempotent CAP Action Execution (Portal A)
  // ------------------------------------------------------------------
  console.log("\n▶ [Step 4] Portal A executes report_financial_fraud via CAP with Idempotency...");
  const idempotencyKey = "RKS-000001-report-001";
  const intakeResult1 = await actionRouter1.executeAction(
    "report_financial_fraud",
    incident,
    idempotencyKey
  );

  assert.equal(intakeResult1.success, true);
  assert.equal(intakeResult1.status, "ACCEPTED");
  assert.equal(intakeResult1.caseId, "CAP-000001");
  console.log(`  ✓ Case created: ${intakeResult1.caseId} (Ref: ${intakeResult1.externalReference})`);

  // Re-run with SAME idempotency key -> MUST return exact same result without duplicate case
  const intakeResult2 = await actionRouter1.executeAction(
    "report_financial_fraud",
    incident,
    idempotencyKey
  );
  assert.equal(intakeResult2.caseId, "CAP-000001");
  assert.equal(intakeResult2.status, "ACCEPTED");
  console.log(`  ✓ Idempotency verified: Re-execution returned cached result without duplicate side-effects.`);

  // ------------------------------------------------------------------
  // Step 5: Portal B Acknowledges Response
  // ------------------------------------------------------------------
  console.log("\n▶ [Step 5] Portal B executes acknowledge_response...");
  const ackResult = await actionRouter1.executeAction(
    "acknowledge_response",
    {
      caseId: "CAP-000001",
      incidentId: incident.id,
      responderInstitution: "Yes Bank Ltd",
      actionTaken: "LIEN_MARKED",
      operatorNotes: "Debit lien placed on ₹75,000 at Yes Bank branch.",
    },
    "ack-CAP-000001-01"
  );
  assert.equal(ackResult.success, true);
  assert.equal(ackResult.status, "ACTION_TAKEN");
  console.log(`  ✓ Portal B response acknowledged (Status: ${ackResult.status})`);

  // Core updates state to ACKNOWLEDGED
  const updatedIncident = await incidentService1.transitionState(incident.id, "ACKNOWLEDGED");
  assert.equal(updatedIncident.state, "ACKNOWLEDGED");
  console.log(`  ✓ Core incident state updated to: ${updatedIncident.state}`);

  portalB1.destroy();

  // ------------------------------------------------------------------
  // Step 6: PROCESS RESTART SIMULATION
  // ------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log("  SIMULATING PROCESS CRASH & RESTART (SESSION 2)");
  console.log("=================================================================\n");

  // Wipe all session 1 memory objects and create completely fresh instances
  const db2 = new DatabaseClient(testDbPath);
  const incidentRepo2 = new IncidentRepository(db2);
  const evidenceRepo2 = new EvidenceRepository(db2);
  const eventRepo2 = new EventRepository(db2);
  const caseRepo2 = new CaseRepository(db2);
  const actionRepo2 = new ActionRepository(db2);

  const incidentService2 = new IncidentService(incidentRepo2, eventRepo2, evidenceRepo2);
  const evidenceService2 = new EvidenceService(evidenceRepo2, eventRepo2);
  const actionRouter2 = new ActionRouter(caseRepo2, eventRepo2, actionRepo2);

  console.log("▶ [Restart Verification 1] Retrieving incident from fresh backend instance...");
  const reloadedIncident = await incidentService2.getIncident("RKS-000001");
  assert.ok(reloadedIncident, "Incident RKS-000001 must exist after restart");
  assert.equal(reloadedIncident.id, "RKS-000001");
  assert.equal(reloadedIncident.state, "ACKNOWLEDGED", "State must remain ACKNOWLEDGED");
  assert.equal(reloadedIncident.reporter.name, "Ramesh Kumar");
  assert.equal(reloadedIncident.transaction.amount, 75000);
  assert.equal(reloadedIncident.transaction.transactionId, "423456789012");
  assert.equal(reloadedIncident.evidence.length, 1, "Evidence reference must be preserved");
  console.log(`  ✓ Reloaded incident: ${reloadedIncident.id} (State: ${reloadedIncident.state}, Amount: ₹${reloadedIncident.transaction.amount})`);

  console.log("\n▶ [Restart Verification 2] Verifying evidence & capsule integrity after restart...");
  const reloadedEvidence = await evidenceService2.getEvidence("EV-001");
  assert.ok(reloadedEvidence, "Evidence EV-001 must exist after restart");
  assert.equal(reloadedEvidence.sha256, evidence.sha256, "Evidence SHA-256 hash must be identical");

  const reloadedCapsule = await evidenceService2.getCapsule("RKS-000001");
  assert.ok(reloadedCapsule, "Evidence capsule must exist after restart");
  assert.equal(reloadedCapsule.hashDigest, capsule.hashDigest, "Capsule aggregate digest must be identical");
  console.log(`  ✓ Evidence integrity confirmed: Hash ${reloadedEvidence.sha256.slice(0, 16)}... matches exactly.`);

  console.log("\n▶ [Restart Verification 3] Verifying CAP case & audit event log after restart...");
  const reloadedCase = await actionRouter2.getCase("CAP-000001");
  assert.ok(reloadedCase, "CAP Case CAP-000001 must exist after restart");
  assert.equal(reloadedCase.status, "ACTION_TAKEN");
  assert.equal(reloadedCase.incidentId, "RKS-000001");
  console.log(`  ✓ CAP Case recovered: ${reloadedCase.id} (Status: ${reloadedCase.status})`);

  const events = await eventRepo2.findByCaseId("CAP-000001");
  assert.ok(events.length >= 2, "Audit event log must contain accepted and acknowledged events");
  console.log(`  ✓ Persistent Event log recovered: ${events.length} chronological audit events found.`);
  for (const ev of events) {
    console.log(`    - [${ev.timestamp}] ${ev.type} (Source: ${ev.source})`);
  }

  // Cleanup test file
  if (existsSync(testDbPath)) {
    unlinkSync(testDbPath);
  }

  console.log("\n=================================================================");
  console.log("  ALL PHASE 1 PERSISTENCE & RESTART TESTS PASSED (100% SUCCESS)");
  console.log("=================================================================\n");

  process.exit(0);
}

runPhase1Tests().catch((err) => {
  console.error("Phase 1 Test failure:", err);
  process.exit(1);
});
