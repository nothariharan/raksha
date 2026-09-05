/**
 * Raksha product thesis — one-shot autonomous chain.
 *
 * Proves in a single run:
 *   process → READY → citizen confirms → CAP
 *   → SUBMITTED/ACKNOWLEDGED + 1930-SYN-*
 *   → Portal B LIEN_MARKED
 *   → audit acknowledgment
 *   → WhatsApp notification
 *   → STATUS same RKS-* + 1930-SYN-*
 *   → Phone/Web resume stays READY (no re-extraction demotion)
 *
 * Run: pnpm exec tsx test/raksha-thesis.test.ts
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
  buildCitizenCaseView,
} from "@raksha/core";
import { ActionRouter } from "@raksha/cap";
import { PortalAIntakeService } from "@raksha/portal-a";
import { PortalBResponseService } from "@raksha/portal-b";
import {
  WhatsAppService,
  WhatsAppConversationStore,
  wireWhatsAppHandoffSubscriber,
  unwireWhatsAppHandoffSubscriber,
} from "@raksha/agent-whatsapp";
import { createCAPClient } from "@raksha/cap-sdk";
import { globalEventBus, resetCounters, normalizeMobile } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "raksha-thesis");
process.env.CAP_MODE = "in-memory";
process.env.FORCE_FILE_DB = "true";

function wipe(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

async function run(): Promise<void> {
  mkdirSync(ROOT, { recursive: true });
  const dbPath = join(ROOT, `thesis-${Date.now()}.json`);
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
  (capClient as any).executeAction = (a: string, p: unknown, k?: string) =>
    actionRouter.executeAction(a as any, p, k);
  (capClient as any).emitEvent = (e: any) => globalEventBus.emit(e);
  (capClient as any).getCase = (id: string) => caseRepo.findById(id);

  const portalA = new PortalAIntakeService(capClient);
  const portalB = new PortalBResponseService(capClient);

  const waStore = new WhatsAppConversationStore();
  const waService = new WhatsAppService({ conversationStore: waStore });
  const notified: Array<{ mobile: string; incidentId: string; referenceNumber: string }> = [];
  const followNotified: Array<{ mobile: string; incidentId: string }> = [];
  waService.notifyCitizenIncidentAccepted = async (params) => {
    notified.push({
      mobile: normalizeMobile(params.mobile),
      incidentId: params.incidentId,
      referenceNumber: params.referenceNumber,
    });
    return {
      success: true,
      replyText: "ok",
      incidentId: params.incidentId,
      state: "SUBMITTED",
    };
  };
  waService.notifyCitizenFollowUp = async (params) => {
    followNotified.push({
      mobile: normalizeMobile(params.mobile),
      incidentId: params.incidentId,
    });
    return {
      success: true,
      replyText: "follow-up ok",
      incidentId: params.incidentId,
      state: "FOLLOW_UP_REQUIRED",
    };
  };
  waService.getIncidentStatus = async (id) => incidentService.getIncident(id);
  wireWhatsAppHandoffSubscriber(waService);

  console.log("\n====================================================");
  console.log("  RAKSHA PRODUCT THESIS — One-Shot Autonomous Chain");
  console.log("====================================================\n");

  // 1. Intake
  const step1 = await processService.processInput({
    source: "web",
    modality: "text",
    content:
      "Electricity scam call. I paid ₹5000 via PhonePe from State Bank of India. UTR 423456789012",
    language: "en",
    reporter: { mobile: "+919876543210", name: "Ramesh Kumar" },
  });
  assert.equal(step1.state, "READY", `expected READY, got ${step1.state}`);
  const incidentId = step1.incidentId;
  console.log(`  ✓ 1. Intake → ${incidentId} READY`);

  // 2. Citizen confirmation → CAP (only human action after intake)
  const incident = await incidentService.getIncident(incidentId);
  assert.ok(incident);
  const cap = await actionRouter.executeAction(
    "report_financial_fraud",
    { incident },
    `thesis-cap-${incidentId}`
  );
  assert.equal(cap.success, true);
  assert.ok(cap.externalReference?.startsWith("1930-SYN-"));
  console.log(`  ✓ 2. Citizen confirm → CAP ${cap.caseId} ${cap.externalReference}`);

  await new Promise((r) => setTimeout(r, 80));

  // 3. Core handoff state
  const afterCap = await incidentService.getIncident(incidentId);
  assert.ok(["SUBMITTED", "ACKNOWLEDGED"].includes(afterCap!.state));
  assert.ok(afterCap!.handoff?.externalReference?.startsWith("1930-SYN-"));
  console.log(`  ✓ 3. Core state=${afterCap!.state} ref=${afterCap!.handoff!.externalReference}`);

  // 4. Portal A 1930 case
  const pa = portalA.getPortalCaseByIncidentId(incidentId);
  assert.ok(pa);
  assert.ok(pa!.externalReference.includes("1930"));
  console.log(`  ✓ 4. Portal A ${pa!.portalCaseId} ${pa!.externalReference}`);

  // 5. Portal B LIEN_MARKED
  const alert = portalB.getAlertByIncidentId(incidentId);
  assert.ok(alert);
  assert.equal(alert!.status, "LIEN_MARKED");
  console.log(`  ✓ 5. Portal B LIEN_MARKED (auto)`);

  // 6. Audit acknowledgment
  const events = await eventRepo.findByIncidentId(incidentId);
  assert.ok(events.some((e) => e.type === "incident.accepted"));
  assert.ok(events.some((e) => e.type === "response.acknowledged"));
  console.log(`  ✓ 6. Audit has incident.accepted + response.acknowledged`);

  // 7. WhatsApp notification
  assert.ok(notified.length >= 1);
  assert.equal(notified[0].incidentId, incidentId);
  assert.ok(notified[0].referenceNumber.startsWith("1930-SYN-"));
  console.log(`  ✓ 7. WhatsApp notify → ${notified[0].referenceNumber}`);

  // 8. STATUS same case + ref
  waStore.bindIncident("919876543210", incidentId, afterCap!.state);
  const status = await waService.handleIncomingMessage({
    From: "whatsapp:+919876543210",
    Body: `STATUS ${incidentId}`,
    MessageSid: `THESIS-STATUS-${Date.now()}`,
  });
  assert.equal(status.incidentId, incidentId);
  assert.ok(status.replyText.includes(incidentId));
  assert.ok(
    status.replyText.includes(afterCap!.handoff!.externalReference!) ||
      status.replyText.includes("1930-SYN")
  );
  console.log(`  ✓ 8. STATUS → ${status.incidentId} + 1930-SYN`);

  // 9. Resume semantics: Phone continue must NOT demote READY → QUESTION_PENDING
  await incidentRepo.update(incidentId, { state: "READY" });
  const resumeReady = await processService.processInput({
    source: "phone",
    modality: "voice",
    content: "Continue my report",
    language: "en",
    reporter: { mobile: "9876543210" },
  });
  assert.equal(resumeReady.incidentId, incidentId);
  assert.equal(resumeReady.state, "READY", `resume must stay READY, got ${resumeReady.state}`);
  assert.equal(resumeReady.incident.transaction?.transactionId, "423456789012");
  console.log(`  ✓ 9a. READY resume stays READY`);

  // 9b. After handoff, short continue attaches to same ACKNOWLEDGED case (not a new RKS)
  await incidentRepo.update(incidentId, {
    state: "ACKNOWLEDGED",
    handoff: {
      target: "portal-a",
      status: "ACKNOWLEDGED",
      externalReference: afterCap!.handoff!.externalReference,
    },
  });
  const resumeAck = await processService.processInput({
    source: "phone",
    modality: "voice",
    content: "Continue my report",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });
  assert.equal(resumeAck.incidentId, incidentId);
  assert.equal(resumeAck.state, "ACKNOWLEDGED");
  console.log(`  ✓ 9b. ACKNOWLEDGED continue resumes same case`);

  // 10. Stale case → FOLLOW_UP_AVAILABLE → citizen YES → follow_up_case (idempotent)
  const eventsBefore = await eventRepo.findByIncidentId(incidentId);
  const staleNow = Date.now();
  const viewStale = buildCitizenCaseView({
    incident: (await incidentService.getIncident(incidentId))!,
    events: eventsBefore,
    language: "en",
    now: staleNow,
    followUpAfterMs: 1000,
  });
  // Force staleness by pretending last clock was long ago
  const viewForced = buildCitizenCaseView({
    incident: {
      ...(await incidentService.getIncident(incidentId))!,
      handoff: {
        ...(await incidentService.getIncident(incidentId))!.handoff,
        acknowledgedAt: new Date(staleNow - 15 * 24 * 60 * 60 * 1000).toISOString(),
        submittedAt: new Date(staleNow - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      updatedAt: new Date(staleNow - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    events: eventsBefore.map((e) =>
      ["incident.accepted", "service.accepted", "incident.submitted"].includes(String(e.type))
        ? { ...e, timestamp: new Date(staleNow - 15 * 24 * 60 * 60 * 1000).toISOString() }
        : e
    ),
    language: "en",
    now: staleNow,
  });
  assert.equal(viewForced.followUpAvailable, true);
  assert.equal(viewForced.citizenStatus, "FOLLOW_UP_AVAILABLE");
  assert.match(viewForced.spokenStatus, /No new response has been recorded/i);
  void viewStale;

  const follow1 = await actionRouter.executeAction(
    "follow_up_case",
    {
      incidentId,
      authorizedByCitizen: true,
      note: "Thesis citizen follow-up",
    },
    `follow-up-${incidentId}`
  );
  assert.equal(follow1.success, true);
  await new Promise((r) => setTimeout(r, 80));

  const follow2 = await actionRouter.executeAction(
    "follow_up_case",
    {
      incidentId,
      authorizedByCitizen: true,
      note: "Duplicate YES",
    },
    `follow-up-${incidentId}`
  );
  assert.equal(follow2.success, true);
  assert.equal(follow2.caseId, follow1.caseId);

  const afterFollow = await incidentService.getIncident(incidentId);
  assert.equal(afterFollow!.state, "FOLLOW_UP_REQUIRED");
  const eventsAfter = await eventRepo.findByIncidentId(incidentId);
  const followEvents = eventsAfter.filter((e) => e.type === "case.followed_up");
  assert.equal(followEvents.length, 1);
  assert.ok(followNotified.some((n) => n.incidentId === incidentId));
  const paAfter = portalA.getPortalCaseByIncidentId(incidentId);
  assert.ok(paAfter?.timeline?.some((row) => /follow-up/i.test(row.label)));

  waStore.bindIncident("919876543210", incidentId, "FOLLOW_UP_REQUIRED");
  const statusAfter = await waService.handleIncomingMessage({
    From: "whatsapp:+919876543210",
    Body: `STATUS ${incidentId}`,
    MessageSid: `THESIS-STATUS-FOLLOW-${Date.now()}`,
  });
  assert.equal(statusAfter.incidentId, incidentId);
  assert.match(statusAfter.replyText, /follow-up|FOLLOW_UP|remains active/i);
  console.log(`  ✓ 10. Stale → follow_up_case idempotent + WhatsApp + Portal A timeline`);

  // 9c. Explicit new fraud narrative after terminal still creates a new case
  const fresh = await processService.processInput({
    source: "web",
    modality: "text",
    content: "Second fraud for same person. Lost ₹9000 via GPay UTR 999888777666",
    language: "en",
    reporter: { mobile: "+919876543210" },
  });
  assert.notEqual(fresh.incidentId, incidentId);
  console.log(`  ✓ 9c. New fraud narrative → ${fresh.incidentId}`);

  unwireWhatsAppHandoffSubscriber();
  portalA.destroy();
  portalB.destroy();
  wipe(dbPath);

  console.log("\n====================================================");
  console.log("  PRODUCT THESIS PASSED — report, track, follow up, same RKS-*");
  console.log("====================================================\n");
}

run().catch((err) => {
  console.error("raksha-thesis failure:", err);
  process.exit(1);
});
