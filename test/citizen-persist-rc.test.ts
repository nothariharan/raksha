/**
 * Release-candidate preflight — Minute 1 → Minute 2 persist-after-filing.
 *
 * Real demo path against an isolated DB (same wiring as WhatsApp edge):
 *   file → CAP → Portal B lien ignored for stale clock → backdate like demo-stale
 *   → citizen view FOLLOW_UP_AVAILABLE → WhatsApp STATUS / already-reported
 *   → YES follow_up_case (idempotent) → Phone spoken status + follow-up
 *   → continue-intent does not open a second RKS-*
 *
 * Run: pnpm exec tsx test/citizen-persist-rc.test.ts
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
  CASE_CLOCK_EVENT_TYPES,
  SIMULATION_LABEL,
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
import { PhoneToolsHandler } from "@raksha/agent-phone";
import { createCAPClient } from "@raksha/cap-sdk";
import { globalEventBus, resetCounters, normalizeMobile } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "citizen-persist-rc");
const MOBILE = "+919811122233";
const MOBILE_DIGITS = normalizeMobile(MOBILE);
process.env.CAP_MODE = "in-memory";
process.env.FORCE_FILE_DB = "true";
process.env.PROTOCOL_PUBLIC_ORIGIN = "https://raksha-protocol.onrender.com";
delete process.env.PORTAL_A_BASE_URL;
delete process.env.PORTAL_B_BASE_URL;
delete process.env.RAKSHA_FOLLOW_UP_AFTER_MS;

function wipe(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

/** Same mutation demo-stale.ts applies — backdate 1930/CAP case-clock events only. */
function backdateCaseClock(db: DatabaseClient, incidentId: string, days: number): string {
  const shiftMs = days * 24 * 60 * 60 * 1000;
  const targetLast = new Date(Date.now() - shiftMs).toISOString();
  const data = db.getData();
  data.events = (data.events || []).map(
    (ev: { id: string; type: string; timestamp: string; incidentId?: string }) => {
      if (ev.incidentId !== incidentId) return ev;
      if (!CASE_CLOCK_EVENT_TYPES.has(String(ev.type))) return ev;
      const t = Date.parse(ev.timestamp);
      return {
        ...ev,
        timestamp: Number.isFinite(t) ? new Date(t - shiftMs).toISOString() : targetLast,
      };
    }
  );
  db.persistToDisk();
  return targetLast;
}

async function run(): Promise<void> {
  mkdirSync(ROOT, { recursive: true });
  const dbPath = join(ROOT, `persist-${Date.now()}.json`);
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

  const followNotified: Array<{ mobile: string; incidentId: string }> = [];
  const waStore = new WhatsAppConversationStore();
  const waService = new WhatsAppService({
    conversationStore: waStore,
    processInput: (input) => processService.processInput(input),
    executeCap: (incident, key) =>
      actionRouter.executeAction("report_financial_fraud", incident, key),
    executeAction: (action, payload, key) =>
      actionRouter.executeAction(action as any, payload, key),
    incidentLookup: {
      findOpenByMobile: (m) => incidentService.findOpenByMobile(m),
      findLatestByMobile: (m) => incidentService.findLatestByMobile(m),
      getIncident: (id) => incidentService.getIncident(id),
      listEvents: (id) => eventRepo.findByIncidentId(id),
    },
    sendOutbound: async () => ({ attempted: true, sent: true, sid: "SM-RC" }),
  });
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
  wireWhatsAppHandoffSubscriber(waService);

  const phoneTools = new PhoneToolsHandler({
    incidentLookup: (id) => incidentService.getIncident(id),
    findByMobile: async (mobile) => {
      const open = await incidentService.findOpenByMobile(mobile);
      return open || (await incidentService.findLatestByMobile(mobile));
    },
    listEvents: (id) => eventRepo.findByIncidentId(id),
    executeAction: (action, payload, key) =>
      actionRouter.executeAction(action as any, payload, key),
    processInput: (input) => processService.processInput(input),
  });

  console.log("\n====================================================");
  console.log("  RC PREFLIGHT — Persist after filing");
  console.log("====================================================\n");

  // --- Minute 1: file + CAP ---
  const intake = await processService.processInput({
    source: "web",
    modality: "text",
    content:
      "Someone called saying tax refund. I paid ₹12500 via UPI from HDFC. UTR 123456789012",
    language: "en",
    reporter: { mobile: MOBILE, name: "RC Preflight" },
  });
  assert.ok(intake.incidentId);
  const incidentId = intake.incidentId!;

  let ready = await incidentService.getIncident(incidentId);
  if (ready!.state !== "READY") {
    await processService.processInput({
      source: "web",
      modality: "text",
      content: "UTR is 123456789012 bank HDFC amount 12500",
      language: "en",
      reporter: { mobile: MOBILE },
      incidentId,
    });
    ready = await incidentService.getIncident(incidentId);
  }
  if (ready!.state !== "READY") {
    await incidentRepo.update(incidentId, {
      state: "READY",
      transaction: {
        amount: 12500,
        currency: "INR",
        debitInstitution: "HDFC",
        transactionId: "123456789012",
        transactionType: "UPI",
      },
    });
  }

  const incident = await incidentService.getIncident(incidentId);
  assert.ok(incident);
  const confirm = await actionRouter.executeAction(
    "report_financial_fraud",
    { incident },
    `report-${incidentId}`
  );
  assert.equal(confirm.success, true);
  assert.ok(confirm.externalReference?.startsWith("1930-SYN-"));
  await new Promise((r) => setTimeout(r, 120));

  const afterCap = await incidentService.getIncident(incidentId);
  assert.ok(afterCap?.handoff?.externalReference?.startsWith("1930-SYN-"));
  assert.ok(["SUBMITTED", "ACKNOWLEDGED"].includes(String(afterCap!.state)));
  console.log(`  ✓ Minute 1: ${incidentId} → ${afterCap!.handoff!.externalReference}`);

  // Portal B lien must NOT reset the 1930 stale clock
  const eventsFresh = await eventRepo.findByIncidentId(incidentId);
  assert.ok(eventsFresh.some((e) => e.type === "response.acknowledged"));
  const viewFresh = buildCitizenCaseView({
    incident: afterCap!,
    events: eventsFresh,
    language: "en",
  });
  assert.equal(viewFresh.followUpAvailable, false);
  const clockOnly = eventsFresh
    .filter((e) => CASE_CLOCK_EVENT_TYPES.has(String(e.type)))
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))[0];
  assert.equal(viewFresh.lastUpdateAt.slice(0, 19), clockOnly.timestamp.slice(0, 19));
  console.log(`  ✓ Portal B lien does not drive case-clock lastUpdateAt`);

  // --- Minute 2: demo-stale equivalent ---
  const targetLast = backdateCaseClock(db, incidentId, 14);
  await incidentRepo.update(incidentId, {
    updatedAt: targetLast,
    handoff: {
      ...afterCap!.handoff,
      submittedAt: targetLast,
      acknowledgedAt: targetLast,
      nextRequiredAction: "Citizen may authorize follow-up if no new 1930 response",
    },
  });

  const eventsStale = await eventRepo.findByIncidentId(incidentId);
  const incidentStale = (await incidentService.getIncident(incidentId))!;
  const viewStale = buildCitizenCaseView({
    incident: incidentStale,
    events: eventsStale,
    language: "en",
  });
  assert.equal(viewStale.citizenStatus, "FOLLOW_UP_AVAILABLE");
  assert.equal(viewStale.followUpAvailable, true);
  assert.ok(viewStale.daysSinceUpdate >= 14);
  assert.match(viewStale.spokenStatus, /No new response has been recorded/i);
  assert.match(viewStale.spokenStatus, /follow up/i);
  assert.equal(viewStale.simulationLabel, SIMULATION_LABEL);
  console.log(
    `  ✓ demo-stale: FOLLOW_UP_AVAILABLE (${viewStale.daysSinceUpdate}d) same ${incidentId}`
  );

  // Phone status before follow-up should offer it
  const phoneBefore = await phoneTools.getIncidentStatus({
    callerPhone: MOBILE,
    language: "en",
  });
  assert.ok(!("error" in phoneBefore && phoneBefore.error));
  assert.equal((phoneBefore as { view: { followUpAvailable: boolean } }).view.followUpAvailable, true);
  assert.match((phoneBefore as { speech: string }).speech, /Would you like me to follow up/i);
  console.log(`  ✓ Phone status offers follow-up`);

  // WhatsApp: "already reported" must not open a new case
  waStore.bindIncident(MOBILE_DIGITS, incidentId, String(incidentStale.state));
  const already = await waService.handleIncomingMessage({
    From: `whatsapp:${MOBILE}`,
    Body: "I already reported a fraud — what happened to my report?",
    MessageSid: `RC-ALREADY-${Date.now()}`,
  });
  assert.equal(already.incidentId, incidentId);
  assert.match(already.replyText, /Would you like me to follow up/i);
  assert.match(already.replyText, /portal-a/);
  assert.match(already.replyText, /raksha-protocol\.onrender\.com/);
  assert.doesNotMatch(already.replyText, /localhost:3003/);
  console.log(`  ✓ WhatsApp already-reported → status + follow-up offer (same RKS)`);

  const status = await waService.handleIncomingMessage({
    From: `whatsapp:${MOBILE}`,
    Body: `STATUS ${incidentId}`,
    MessageSid: `RC-STATUS-${Date.now()}`,
  });
  assert.equal(status.incidentId, incidentId);
  assert.match(status.replyText, /FOLLOW_UP_AVAILABLE|follow up/i);

  // Unauthorized follow-up must fail
  const denied = await actionRouter.executeAction(
    "follow_up_case",
    { incidentId, authorizedByCitizen: false },
    `follow-up-denied-${incidentId}`
  );
  assert.equal(denied.success, false);

  // YES → follow_up_case via WhatsApp session
  const yes = await waService.handleIncomingMessage({
    From: `whatsapp:${MOBILE}`,
    Body: "YES",
    MessageSid: `RC-YES-${Date.now()}`,
  });
  assert.equal(yes.incidentId, incidentId);
  assert.match(yes.replyText, /follow-up|remains active/i);
  await new Promise((r) => setTimeout(r, 120));

  const afterFollow = await incidentService.getIncident(incidentId);
  assert.equal(afterFollow!.state, "FOLLOW_UP_REQUIRED");
  const followEvents = (await eventRepo.findByIncidentId(incidentId)).filter(
    (e) => e.type === "case.followed_up"
  );
  assert.equal(followEvents.length, 1);
  assert.ok(followNotified.some((n) => n.incidentId === incidentId));

  // Duplicate YES / CAP idempotency
  const dup = await actionRouter.executeAction(
    "follow_up_case",
    { incidentId, authorizedByCitizen: true, note: "dup" },
    `follow-up-${incidentId}`
  );
  assert.equal(dup.success, true);
  const followEvents2 = (await eventRepo.findByIncidentId(incidentId)).filter(
    (e) => e.type === "case.followed_up"
  );
  assert.equal(followEvents2.length, 1);

  const pa = portalA.getPortalCaseByIncidentId(incidentId);
  assert.ok(pa?.timeline?.some((row) => /Citizen follow-up received/i.test(row.label)));
  console.log(`  ✓ YES → follow_up_case idempotent + WhatsApp notify + Portal A timeline`);

  // Phone after follow-up
  const phoneAfter = await phoneTools.getIncidentStatus({
    callerPhone: MOBILE,
    language: "en",
  });
  assert.equal((phoneAfter as { view: { citizenStatus: string } }).view.citizenStatus, "FOLLOW_UP_SENT");
  assert.match((phoneAfter as { speech: string }).speech, /follow-up|FOLLOW_UP|active/i);

  const phoneFollow = await phoneTools.followUpCase({
    callerPhone: MOBILE,
    language: "en",
    authorizedByCitizen: true,
  });
  assert.equal(phoneFollow.success, true);
  assert.equal(phoneFollow.incidentId, incidentId);
  console.log(`  ✓ Phone status + follow_up tools same ${incidentId}`);

  // STATUS after follow-up still same case, no new incident
  const status2 = await waService.handleIncomingMessage({
    From: `whatsapp:${MOBILE}`,
    Body: `STATUS ${incidentId}`,
    MessageSid: `RC-STATUS2-${Date.now()}`,
  });
  assert.equal(status2.incidentId, incidentId);
  const listed = await incidentRepo.list();
  const forMobile = listed.filter(
    (i) => normalizeMobile(i.reporter?.mobile || "") === MOBILE_DIGITS
  );
  assert.equal(forMobile.length, 1, "STATUS/already-reported must not open a second case");

  // Continue-intent: "kya hua" resumes same filed case
  const kya = await processService.processInput({
    source: "whatsapp",
    modality: "text",
    content: "kya hua meri report",
    language: "hi",
    reporter: { mobile: MOBILE },
  });
  assert.equal(kya.incidentId, incidentId);
  console.log(`  ✓ continue-intent keeps same RKS-*`);

  unwireWhatsAppHandoffSubscriber();
  portalA.destroy();
  portalB.destroy();
  wipe(dbPath);

  console.log("\n====================================================");
  console.log("  RC PREFLIGHT PASSED — ready for live Minute 1/2 tests");
  console.log("====================================================\n");
}

run().catch((err) => {
  console.error("\nRC PREFLIGHT FAILED\n", err);
  process.exit(1);
});
