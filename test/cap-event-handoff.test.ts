/**
 * CAP Event-Driven Handoff — integration test.
 *
 * Proves the autonomous chain after citizen confirmation:
 *   CAP execute → incident.accepted (once)
 *   → Portal A 1930-SYN case + service.accepted
 *   → Portal B auto LIEN_MARKED + response.acknowledged
 *   → WhatsApp notify subscriber fired
 *   → STATUS resolves same incident with institutional ref
 *   → Second CAP execute is idempotent (same caseId)
 *
 * Run: pnpm exec tsx test/cap-event-handoff.test.ts
 */

import assert from "node:assert/strict";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  DatabaseClient,
  IdentityAllocator,
  IncidentRepository,
  IncidentService,
  CaseRepository,
  EventRepository,
  ActionRepository,
  ProcessService,
} from "@raksha/core";
import { ActionRouter } from "@raksha/cap";
import { PortalAIntakeService } from "@raksha/portal-a";
import { PortalBResponseService } from "@raksha/portal-b";
import { WhatsAppService, WhatsAppConversationStore, wireWhatsAppHandoffSubscriber, unwireWhatsAppHandoffSubscriber } from "@raksha/agent-whatsapp";
import { createCAPClient } from "@raksha/cap-sdk";
import { globalEventBus, resetCounters, normalizeMobile } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "cap-handoff");
process.env.CAP_MODE = "in-memory";
process.env.FORCE_FILE_DB = "true";

function uniqueDbPath(): string {
  mkdirSync(ROOT, { recursive: true });
  return join(ROOT, `raksha-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
}

function wipe(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

async function run(): Promise<void> {
  const dbPath = uniqueDbPath();
  wipe(dbPath);
  resetCounters();
  globalEventBus.clear();

  const db = new DatabaseClient(dbPath);
  await db.ensureSchema();
  const ids = new IdentityAllocator(db);
  await ids.syncSequences();
  globalEventBus.setIdFactory(() => ids.allocateEventId("EVT"));

  const incidentRepo = new IncidentRepository(db);
  const incidentService = new IncidentService(incidentRepo, undefined, undefined, ids);
  const processService = new ProcessService(incidentService);
  const caseRepo = new CaseRepository(db);
  const eventRepo = new EventRepository(db);
  const actionRepo = new ActionRepository(db);
  const actionRouter = new ActionRouter(caseRepo, eventRepo, actionRepo, ids, incidentRepo);

  const capClient = createCAPClient({ mode: "in-memory" });
  // Replace in-memory execute with our router so Portal B ack hits the same store
  (capClient as any).executeAction = (
    action: string,
    payload: unknown,
    key?: string
  ) => actionRouter.executeAction(action as any, payload, key);
  (capClient as any).emitEvent = (event: any) => globalEventBus.emit(event);
  (capClient as any).getCase = (id: string) => caseRepo.findById(id);

  const portalA = new PortalAIntakeService(capClient);
  const portalB = new PortalBResponseService(capClient);

  const waStore = new WhatsAppConversationStore();
  const waService = new WhatsAppService({
    conversationStore: waStore,
  });
  // Stub notify to capture rather than Twilio
  const notified: Array<{ mobile: string; incidentId: string; referenceNumber: string }> = [];
  waService.notifyCitizenIncidentAccepted = async (params) => {
    notified.push({
      mobile: normalizeMobile(params.mobile),
      incidentId: params.incidentId,
      referenceNumber: params.referenceNumber,
    });
    return { success: true, replyText: "ok", incidentId: params.incidentId, state: "SUBMITTED" };
  };
  wireWhatsAppHandoffSubscriber(waService);
  // Point STATUS lookups at the isolated Core store used by this test
  waService.getIncidentStatus = async (id: string) => incidentService.getIncident(id);

  console.log("\n====================================================");
  console.log("  CAP Event-Driven Handoff — Test Suite");
  console.log("====================================================\n");

  // 1. Citizen creates READY incident via Core
  const ready = await processService.processInput({
    source: "web",
    modality: "text",
    content:
      "Electricity scam. Paid ₹5000 via PhonePe from State Bank of India UTR 423456789012",
    language: "en",
    reporter: { mobile: "+919876543210", name: "Ramesh Kumar" },
  });
  assert.ok(ready.incidentId);
  const incidentId = ready.incidentId;
  console.log(`  ✓ Citizen incident ready: ${incidentId} state=${ready.state}`);

  // 2. Citizen confirmation → CAP execute (only human action)
  const incident = await incidentService.getIncident(incidentId);
  assert.ok(incident);

  const cap1 = await actionRouter.executeAction(
    "report_financial_fraud",
    { incident },
    `web-cap-${incidentId}`
  );
  assert.equal(cap1.success, true);
  assert.ok(cap1.externalReference?.startsWith("1930-SYN-"));
  console.log(`  ✓ CAP accepted: case=${cap1.caseId} ref=${cap1.externalReference}`);

  // Allow async subscribers to settle
  await new Promise((r) => setTimeout(r, 50));

  // 3. incident.accepted exactly once (semantic)
  const acceptedEvents = globalEventBus.getEvents({ type: "incident.accepted", incidentId });
  assert.equal(acceptedEvents.length, 1, "incident.accepted must emit once");
  console.log(`  ✓ incident.accepted emitted once`);

  // 4. Portal A auto-ingested
  const paCase = portalA.getPortalCaseByIncidentId(incidentId);
  assert.ok(paCase, "Portal A must auto-create 1930 case from event");
  assert.ok(paCase!.externalReference.startsWith("1930-SYN-") || paCase!.externalReference.includes("1930"));
  console.log(`  ✓ Portal A case: ${paCase!.portalCaseId} ref=${paCase!.externalReference}`);

  // 5. service.accepted emitted
  const serviceEvents = globalEventBus.getEvents({ type: "service.accepted", incidentId });
  assert.ok(serviceEvents.length >= 1, "service.accepted must be emitted");
  console.log(`  ✓ service.accepted emitted (${serviceEvents.length})`);

  // 6. Portal B auto LIEN_MARKED
  await new Promise((r) => setTimeout(r, 50));
  const alert = portalB.getAlertByIncidentId(incidentId);
  assert.ok(alert, "Portal B must have alert");
  assert.equal(alert!.status, "LIEN_MARKED");
  assert.equal(alert!.lifecycle, "ACKNOWLEDGED");
  assert.equal(alert!.autoAcknowledged, true);
  console.log(`  ✓ Portal B auto LIEN_MARKED`);

  // 7. response.acknowledged in audit
  const ackEvents = globalEventBus.getEvents({ type: "response.acknowledged", incidentId });
  assert.ok(ackEvents.length >= 1, "response.acknowledged must be in audit");
  const persisted = await eventRepo.findByIncidentId(incidentId);
  assert.ok(persisted.some((e) => e.type === "incident.accepted"));
  console.log(`  ✓ Audit trail has incident.accepted + response.acknowledged`);

  // 8. WhatsApp notify auto
  assert.ok(notified.length >= 1, "WhatsApp notify must fire automatically");
  assert.equal(notified[0].incidentId, incidentId);
  assert.equal(notified[0].mobile, "919876543210");
  console.log(`  ✓ WhatsApp notify auto → ${notified[0].mobile}`);

  // 9. Idempotent second CAP execute
  const cap2 = await actionRouter.executeAction(
    "report_financial_fraud",
    { incident },
    `web-cap-${incidentId}-retry`
  );
  assert.equal(cap2.caseId, cap1.caseId, "Second execute must reuse same CAP case");
  const acceptedAfter = globalEventBus.getEvents({ type: "incident.accepted", incidentId });
  assert.equal(acceptedAfter.length, 1, "Must not re-emit incident.accepted on replay");
  console.log(`  ✓ Idempotent CAP replay → same case ${cap2.caseId}`);

  // 10. WhatsApp STATUS → same incident + institutional ref
  // Bind session so STATUS uses the handed-off incident (terminal states are not "open")
  waStore.bindIncident("919876543210", incidentId, "ACKNOWLEDGED");
  const status = await waService.handleIncomingMessage({
    From: "whatsapp:+919876543210",
    Body: `STATUS ${incidentId}`,
    MessageSid: `WA-STATUS-${Date.now()}`,
  });
  assert.equal(status.incidentId, incidentId);
  assert.ok(status.replyText.includes(incidentId));
  const refreshed = await incidentService.getIncident(incidentId);
  assert.ok(refreshed?.handoff?.externalReference);
  assert.ok(
    refreshed!.handoff!.status === "ACKNOWLEDGED" ||
      refreshed!.handoff!.status === "ACCEPTED"
  );
  assert.ok(
    status.replyText.includes(refreshed!.handoff!.externalReference!) ||
      status.replyText.includes("Institutional")
  );
  console.log(`  ✓ STATUS → ${status.incidentId} handoff=${refreshed?.handoff?.status}`);

  // Cleanup
  unwireWhatsAppHandoffSubscriber();
  portalA.destroy();
  portalB.destroy();
  wipe(dbPath);

  console.log("\n====================================================");
  console.log("  ALL CAP EVENT-DRIVEN HANDOFF CHECKS PASSED");
  console.log("====================================================\n");
}

run().catch((err) => {
  console.error("cap-event-handoff failure:", err);
  process.exit(1);
});
