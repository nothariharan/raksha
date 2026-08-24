/**
 * Raksha Phase 0 — E2E Integration Test Runner
 */

import assert from "node:assert/strict";
import {
  IncidentService,
  ValidationEngine,
  EvidenceService,
} from "@raksha/core";
import { createCAPClient } from "@raksha/cap-sdk";
import { PortalAIntakeService } from "@raksha/portal-a";
import { PortalBResponseService } from "@raksha/portal-b";
import { globalEventBus, resetCounters } from "@raksha/shared";

async function runE2ETests() {
  console.log("\n=======================================================");
  console.log("  RAKSHA PHASE 0: END-TO-END INTEGRATION TEST SUITE");
  console.log("=======================================================\n");

  resetCounters();
  globalEventBus.clear();

  const incidentService = new IncidentService();
  const evidenceService = new EvidenceService();
  const capClient = createCAPClient({ mode: "in-memory" });
  const portalA = new PortalAIntakeService(capClient);
  const portalB = new PortalBResponseService(capClient);

  // -------------------------------------------------------------
  // Test 1: Incident Creation & Evidence Sealing
  // -------------------------------------------------------------
  console.log("▶ [Test 1] Creating canonical incident & sealing evidence...");
  const incident = await incidentService.createIncident({
    source: "web",
    narrative: {
      text: "Electricity scam call; received fake bill message and transferred Rs 5000 via UPI.",
    },
    reporter: {
      mobile: "+919876543210",
      preferredLanguage: "hi",
    },
    transaction: {
      amount: 5000,
      currency: "INR",
      channel: "UPI",
      transactionId: "423456789012",
      timestamp: "2026-08-24T18:42:00+05:30",
      debitInstitution: "State Bank of India",
      beneficiaryIdentifier: "fraudster@upi",
    },
  });

  assert.equal(incident.id, "RKS-000001", "Incident ID must be RKS-000001");
  assert.equal(incident.type, "FINANCIAL_CYBER_FRAUD");
  assert.equal(incident.state, "READY");
  console.log(`  ✓ Canonical Incident created: ${incident.id} (State: ${incident.state})`);

  const evidence = await evidenceService.addEvidence({
    incidentId: incident.id,
    type: "TRANSACTION_SCREENSHOT",
    uri: "synthetic://evidence/screenshot_gpay_5000.png",
    rawContent: "sample_raw_screenshot_binary_buffer",
  });

  assert.equal(evidence.id, "EV-001");
  assert.ok(evidence.sha256);
  assert.equal(evidence.sha256.length, 64);
  console.log(`  ✓ Evidence ingested: ${evidence.id} (SHA-256: ${evidence.sha256.slice(0, 16)}...)`);

  const capsule = evidenceService.sealEvidenceCapsule(incident.id);
  assert.equal(capsule.items.length, 1);
  assert.equal(capsule.hashDigest.length, 64);
  console.log(`  ✓ Evidence Capsule sealed (Digest: ${capsule.hashDigest.slice(0, 16)}...)`);

  // -------------------------------------------------------------
  // Test 2: Deterministic Validation & Contradiction Detection
  // -------------------------------------------------------------
  console.log("\n▶ [Test 2] Deterministic Validation & Contradiction Checking...");
  const validIncident = await incidentService.createIncident({
    source: "whatsapp",
    narrative: { text: "Transferred Rs 5000 to electricity impostor." },
    transaction: {
      amount: 5000,
      transactionId: "423456789012",
      timestamp: "2026-08-24T18:42:00+05:30",
    },
  });
  const validation = ValidationEngine.validate(validIncident);
  assert.equal(validation.status, "READY");
  assert.equal(validation.missingFields.length, 0);
  console.log(`  ✓ Valid incident passed with status: ${validation.status}`);

  const conflictIncident = await incidentService.createIncident({
    source: "phone",
    narrative: { text: "I lost Rs 50000 in this electricity scam." },
    transaction: {
      amount: 5000,
      transactionId: "423456789012",
      timestamp: "2026-08-24T18:42:00+05:30",
    },
  });
  const conflictValidation = ValidationEngine.validate(conflictIncident);
  assert.equal(conflictValidation.status, "CONFLICT");
  assert.ok(conflictValidation.conflicts.length > 0);
  console.log(`  ✓ Contradiction detected: ${conflictValidation.conflicts[0].explanation}`);
  console.log(`  ✓ One-question clarification prompt: "${conflictValidation.nextQuestion}"`);

  // -------------------------------------------------------------
  // Test 3: Full Cross-Service CAP Workflow (Core -> Portal A -> Event -> Portal B -> Core)
  // -------------------------------------------------------------
  console.log("\n▶ [Test 3] Full Cross-Service CAP Workflow...");
  const emergencyIncident = await incidentService.createIncident({
    source: "web",
    narrative: {
      text: "Urgent: Paid ₹75,000 to fake cyber police digital arrest account.",
    },
    reporter: {
      mobile: "+919888877777",
    },
    transaction: {
      amount: 75000,
      currency: "INR",
      channel: "UPI",
      transactionId: "423456789012",
      timestamp: "2026-08-24T19:00:00+05:30",
      debitInstitution: "HDFC Bank",
      beneficiaryIdentifier: "mule.account@ybl",
    },
  });

  console.log(`  1. Core created incident ${emergencyIncident.id}`);

  // Portal A submits to CAP
  const intakeResult = await portalA.reportFraudIncident(emergencyIncident);
  assert.equal(intakeResult.success, true);
  assert.equal(intakeResult.capResponse.status, "ACCEPTED");
  assert.equal(intakeResult.capResponse.caseId, "CAP-000001");
  console.log(`  2. Portal A submitted report through CAP -> Case ID: ${intakeResult.capResponse.caseId}, Ref: ${intakeResult.capResponse.externalReference}`);

  // Check event broadcast
  const events = globalEventBus.getEvents({ caseId: "CAP-000001" });
  const acceptedEvent = events.find((e) => e.type === "incident.accepted");
  assert.ok(acceptedEvent);
  console.log(`  3. CAP emitted event 'incident.accepted' to EventBus`);

  // Verify Portal B received alert
  const portalBAlerts = portalB.listAlerts();
  assert.equal(portalBAlerts.length, 1);
  assert.equal(portalBAlerts[0].caseId, "CAP-000001");
  console.log(`  4. Portal B (Financial Institution Console) received alert for case ${portalBAlerts[0].caseId}`);

  // Portal B acknowledges freeze action
  const ackResult = await portalB.acknowledgeFreeze({
    caseId: "CAP-000001",
    incidentId: emergencyIncident.id,
    responderInstitution: "Yes Bank Ltd",
    actionTaken: "LIEN_MARKED",
    operatorNotes: "Debit lien placed on mule account mule.account@ybl for ₹75,000",
  });
  assert.equal(ackResult.success, true);
  assert.equal(ackResult.status, "ACTION_TAKEN");
  console.log(`  5. Portal B acknowledged action: LIEN_MARKED (Status: ${ackResult.status})`);

  // Core updates state
  const updatedIncident = await incidentService.transitionState(emergencyIncident.id, "ACKNOWLEDGED");
  assert.equal(updatedIncident.state, "ACKNOWLEDGED");
  console.log(`  6. Raksha Core updated incident state -> ${updatedIncident.state}`);

  portalB.destroy();

  console.log("\n=======================================================");
  console.log("  ALL PHASE 0 INTEGRATION TESTS PASSED (100% SUCCESS)");
  console.log("=======================================================\n");

  process.exit(0);
}

runE2ETests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
