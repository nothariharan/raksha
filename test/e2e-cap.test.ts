/**
 * Raksha Phase 0 — End-to-End Integration Test
 *
 * Verifies complete skeleton flow:
 * Incident Creation -> Evidence -> Deterministic Validation -> CAP Handoff
 * -> Portal A (Intake) -> Event Dispatch -> Portal B (Response) -> Acknowledged
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  IncidentService,
  ValidationEngine,
  EvidenceService,
  defaultDbClient,
} from "@raksha/core";
import { createCAPClient } from "@raksha/cap-sdk";
import { PortalAIntakeService } from "@raksha/portal-a";
import { PortalBResponseService } from "@raksha/portal-b";
import { globalEventBus, resetCounters } from "@raksha/shared";

describe("Phase 0 — Raksha End-to-End Architecture Integration", () => {
  let incidentService: IncidentService;
  let evidenceService: EvidenceService;
  let capClient: ReturnType<typeof createCAPClient>;
  let portalA: PortalAIntakeService;
  let portalB: PortalBResponseService;

  beforeEach(() => {
    resetCounters();
    globalEventBus.clear();
    defaultDbClient.clearStorage();

    incidentService = new IncidentService();
    evidenceService = new EvidenceService();
    capClient = createCAPClient({ mode: "in-memory" });
    portalA = new PortalAIntakeService(capClient);
    portalB = new PortalBResponseService(capClient);
  });

  it("Step 1 & 2: creates canonical incident and attaches synthetic evidence with sha256 hash", async () => {
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

    assert.equal(incident.id, "RKS-000001");
    assert.equal(incident.type, "FINANCIAL_CYBER_FRAUD");
    assert.equal(incident.state, "READY");

    // Add synthetic screenshot evidence
    const evidence = await evidenceService.addEvidence({
      incidentId: incident.id,
      type: "TRANSACTION_SCREENSHOT",
      uri: "synthetic://evidence/screenshot_gpay_5000.png",
      rawContent: "sample_raw_screenshot_binary_buffer",
    });

    assert.equal(evidence.id, "EV-001");
    assert.ok(evidence.sha256);
    assert.equal(evidence.sha256.length, 64); // Valid SHA-256 length

    // Seal Evidence Capsule
    const capsule = await evidenceService.sealEvidenceCapsule(incident.id);
    assert.equal(capsule.items.length, 1);
    assert.equal(capsule.hashDigest.length, 64);
  });

  it("Step 3: validates complete incident deterministically and catches contradictions", async () => {
    // Valid incident
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

    // Contradiction: Narrative says Rs 50000, Transaction says 5000
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
    assert.ok(conflictValidation.nextQuestion);
  });

  it("Step 4 - 8: Portal A submits to CAP, receives accepted state, emits event, and Portal B acknowledges", async () => {
    // 1. Create incident in Core
    const incident = await incidentService.createIncident({
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

    // 2. Portal A submits through CAP
    const intakeResult = await portalA.reportFraudIncident(incident);

    assert.equal(intakeResult.success, true);
    assert.ok(intakeResult.portalCase);
    assert.equal(intakeResult.capResponse.status, "ACCEPTED");
    assert.equal(intakeResult.capResponse.caseId, "CAP-000001");
    assert.ok(intakeResult.capResponse.externalReference?.includes("1930"));

    // 3. Verify CAP event was broadcasted
    const events = globalEventBus.getEvents({ caseId: "CAP-000001" });
    const acceptedEvent = events.find((e) => e.type === "incident.accepted");
    assert.ok(acceptedEvent);

    // 4. Verify Portal B received the incident.accepted alert automatically
    const portalBAlerts = portalB.listAlerts();
    assert.equal(portalBAlerts.length, 1);
    assert.equal(portalBAlerts[0].caseId, "CAP-000001");
    assert.equal(portalBAlerts[0].incidentId, incident.id);
    assert.ok(["PENDING_REVIEW", "LIEN_MARKED"].includes(portalBAlerts[0].status));

    // 5. Portal B executes acknowledge_response
    const ackResult = await portalB.acknowledgeFreeze({
      caseId: "CAP-000001",
      incidentId: incident.id,
      responderInstitution: "Yes Bank Ltd",
      actionTaken: "LIEN_MARKED",
      operatorNotes: "Debit lien placed on mule account mule.account@ybl for ₹75,000",
    });

    assert.equal(ackResult.success, true);
    assert.equal(ackResult.status, "ACTION_TAKEN");

    // 6. Verify response.acknowledged event was emitted
    const allEvents = globalEventBus.getEvents({ caseId: "CAP-000001" });
    const ackEvent = allEvents.find((e) => e.type === "response.acknowledged");
    assert.ok(ackEvent);

    // 7. Verify Core state transition
    const updatedIncident = await incidentService.transitionState(incident.id, "ACKNOWLEDGED");
    assert.equal(updatedIncident.state, "ACKNOWLEDGED");
  });
});
