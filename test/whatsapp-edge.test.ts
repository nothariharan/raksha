/**
 * WhatsApp real-edge acceptance:
 *   language → collect missing fields → YES → CAP 1930-SYN
 *   every turn produces an outbound reply
 *   Core remains authoritative across restart
 *   conflict options come from Core, not hardcoded ₹5k/₹50k
 *   Twilio signature + form-urlencoded inbound
 *   Web and WhatsApp share one RKS-*
 *
 * Run: pnpm test:whatsapp-edge
 */

import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import {
  ActionRepository,
  CaseRepository,
  DatabaseClient,
  EventRepository,
  IdentityAllocator,
  IncidentRepository,
  IncidentService,
  ProcessService,
} from "@raksha/core";
import { ActionRouter } from "@raksha/cap";
import {
  WhatsAppConversationStore,
  WhatsAppService,
  computeTwilioSignature,
  handleWhatsAppRequest,
  resolveDeskUrls,
  unwireWhatsAppHandoffSubscriber,
  wireWhatsAppHandoffSubscriber,
} from "@raksha/agent-whatsapp";
import { globalEventBus, normalizeMobile, resetCounters } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "whatsapp-edge");
process.env.CAP_MODE = "in-memory";
process.env.FORCE_FILE_DB = "true";
process.env.TWILIO_VALIDATE_SIGNATURE = "false";
delete process.env.GEMINI_API_KEY;

function wipe(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

async function isolated() {
  mkdirSync(ROOT, { recursive: true });
  const dbPath = join(ROOT, `wa-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
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

  const outbound: Array<{ to: string; body: string }> = [];
  const store = new WhatsAppConversationStore();
  const wa = new WhatsAppService({
    conversationStore: store,
    processInput: (input) => processService.processInput(input),
    executeCap: (incident, key) => actionRouter.executeAction("report_financial_fraud", incident, key),
    incidentLookup: {
      findOpenByMobile: (m) => incidentService.findOpenByMobile(m),
      findLatestByMobile: (m) => incidentService.findLatestByMobile(m),
      getIncident: (id) => incidentService.getIncident(id),
    },
    sendOutbound: async (to, body) => {
      outbound.push({ to, body });
      return { attempted: true, sent: true, sid: `SM-${outbound.length}` };
    },
  });

  return {
    dbPath,
    incidentService,
    processService,
    actionRouter,
    store,
    wa,
    outbound,
    cleanup() {
      unwireWhatsAppHandoffSubscriber();
      wipe(dbPath);
    },
  };
}

async function testHiDoesNotSelectHindi(): Promise<void> {
  const env = await isolated();
  const greet = await env.wa.handleIncomingMessage({
    From: "whatsapp:+919800011122",
    Body: "hi",
    MessageSid: "WA-EDGE-HI",
  });
  assert.match(greet.replyText, /Please choose your language|English/);
  assert.doesNotMatch(greet.replyText, /हिंदी में आगे|हम हिंदी/);
  env.cleanup();
  console.log("  ✓ greeting hi stays on English picker, not Hindi");
}

async function testEnglishStoryDoesNotReaskContext(): Promise<void> {
  const env = await isolated();
  const from = "whatsapp:+919855566677";

  const greet = await env.wa.handleIncomingMessage({
    From: from,
    Body: "hi",
    MessageSid: "WA-STORY-HI",
  });
  assert.match(greet.replyText, /Please choose your language/);

  const lang = await env.wa.handleIncomingMessage({
    From: from,
    Body: "1",
    MessageSid: "WA-STORY-LANG",
  });
  assert.match(lang.replyText, /continue in English/i);
  assert.match(lang.replyText, /describe what happened/i);

  const story = await env.wa.handleIncomingMessage({
    From: from,
    Body: "so i was asked to pay 5000 ruppees to a person with regard to tax but then realised i got scammed",
    MessageSid: "WA-STORY-1",
  });
  assert.ok(story.incidentId, "story must open a Core incident");
  assert.doesNotMatch(
    story.replyText,
    /kind of scam|how it started|how did they contact you/i,
    "a complete paid-tax story must not re-ask for the same story"
  );
  assert.match(story.replyText, /UTR|12-digit|Reference Number|bank/i);

  const incident = await env.incidentService.getIncident(story.incidentId!);
  assert.equal(incident?.validation?.contextCaptured, true);
  assert.equal(incident?.transaction?.amount, 5000);

  env.cleanup();
  console.log("  ✓ English tax-scam story advances to UTR/bank, not a second story prompt");
}

async function testRestartDoesNotReaskLanguage(): Promise<void> {
  const env = await isolated();
  const mobile = "+919866677788";
  const opened = await env.processService.processInput({
    source: "whatsapp",
    modality: "text",
    content:
      "so i was asked to pay 5000 ruppees to a person with regard to tax but then realised i got scammed",
    language: "en",
    reporter: { mobile },
  });
  assert.ok(opened.incidentId);
  assert.equal(opened.incident.reporter.preferredLanguage, "en");

  const coldStore = new WhatsAppConversationStore();
  const cold = new WhatsAppService({
    conversationStore: coldStore,
    processInput: (input) => env.processService.processInput(input),
    executeCap: (incident, key) => env.actionRouter.executeAction("report_financial_fraud", incident, key),
    incidentLookup: {
      findOpenByMobile: (m) => env.incidentService.findOpenByMobile(m),
      findLatestByMobile: (m) => env.incidentService.findLatestByMobile(m),
      getIncident: (id) => env.incidentService.getIncident(id),
    },
    sendOutbound: async (to, body) => {
      env.outbound.push({ to, body });
      return { attempted: true, sent: true, sid: `SM-COLD-${env.outbound.length}` };
    },
  });

  const follow = await cold.handleIncomingMessage({
    From: `whatsapp:${mobile}`,
    Body: "my utr is 123456789012 from sbi bank scam",
    MessageSid: "WA-COLD-UTR",
  });
  assert.doesNotMatch(
    follow.replyText,
    /choose your language|कृपया भाषा/i,
    "a mid-case UTR after restart must not reset the language picker"
  );
  assert.equal(follow.incidentId, opened.incidentId);
  assert.match(follow.replyText, /UTR|SBI|YES|confirm|bank|12/i);

  env.cleanup();
  console.log("  ✓ cold restart keeps English case and accepts UTR, no language picker");
}

async function testLanguageThenCapLoop(): Promise<void> {
  const env = await isolated();
  const from = "whatsapp:+919811122233";

  const first = await env.wa.handleIncomingMessage({
    From: from,
    Body: "Bijli department ne phone kiya aur maine SBI se 5000 PhonePe se bhej diye.",
    MessageSid: "WA-EDGE-1",
  });
  assert.match(first.replyText, /Please choose your language|कृपया भाषा/);
  assert.equal(first.outbound?.sent, true);
  assert.equal(env.outbound.length, 1);

  const lang = await env.wa.handleIncomingMessage({
    From: from,
    Body: "2",
    MessageSid: "WA-EDGE-2",
  });
  assert.ok(lang.incidentId, "language choice must flush the held story into Core");
  assert.equal(env.outbound.length, 2);
  assert.match(lang.replyText, /UTR|राशि|बैंक|YES|हाँ|सही|12/i);

  let state = lang.state;
  let incidentId = lang.incidentId;
  const followUps = [
    "423456789012",
    "Amount 5000 from State Bank of India UTR 423456789012 electricity bill scam on a fake department call",
    "State Bank of India",
  ];
  for (let i = 0; i < followUps.length && state !== "READY"; i++) {
    const more = await env.wa.handleIncomingMessage({
      From: from,
      Body: followUps[i],
      MessageSid: `WA-EDGE-3-${i}`,
    });
    state = more.state;
    incidentId = more.incidentId;
  }
  assert.equal(state, "READY", `expected READY before YES, got ${state}`);
  assert.ok(incidentId);

  const yes = await env.wa.handleIncomingMessage({
    From: from,
    Body: "YES",
    MessageSid: "WA-EDGE-4",
  });
  assert.ok(yes.capResponse?.externalReference?.startsWith("1930-SYN-"));
  assert.match(yes.replyText, /1930-SYN-/);
  assert.match(yes.replyText, /3003|portal-a/i);
  assert.equal(yes.incidentId, incidentId);
  assert.ok(env.outbound.length >= 3);

  const status = await env.wa.handleIncomingMessage({
    From: from,
    Body: `STATUS ${incidentId}`,
    MessageSid: "WA-EDGE-5",
  });
  assert.equal(status.incidentId, incidentId);
  assert.match(status.replyText, new RegExp(incidentId!));

  const restarted = new WhatsAppConversationStore();
  const wa2 = new WhatsAppService({
    conversationStore: restarted,
    processInput: (input) => env.processService.processInput(input),
    executeCap: (incident, key) => env.actionRouter.executeAction("report_financial_fraud", incident, key),
    incidentLookup: {
      findOpenByMobile: (m) => env.incidentService.findOpenByMobile(m),
      findLatestByMobile: (m) => env.incidentService.findLatestByMobile(m),
      getIncident: (id) => env.incidentService.getIncident(id),
    },
    sendOutbound: async (to, body) => {
      env.outbound.push({ to, body });
      return { attempted: true, sent: true };
    },
  });
  const afterRestart = await wa2.handleIncomingMessage({
    From: from,
    Body: `STATUS ${incidentId}`,
    MessageSid: "WA-EDGE-6",
  });
  assert.equal(afterRestart.incidentId, incidentId, "restart must reconstruct the same RKS-* from Core");
  assert.match(afterRestart.replyText, /1930-SYN-|SUBMITTED|ACKNOWLEDGED/);

  env.cleanup();
  console.log(`  ✓ language → collect → YES → CAP ${yes.capResponse?.externalReference} → STATUS after restart`);
}

async function testConflictFromCoreNotHardcoded(): Promise<void> {
  const env = await isolated();
  const mobile = "+919822233344";

  await env.processService.processInput({
    source: "phone",
    modality: "voice",
    content: "Scam call. I paid ₹32000 via PhonePe from HDFC UTR 555666777888",
    language: "en",
    reporter: { mobile },
  });
  const conflicted = await env.processService.processInput({
    source: "whatsapp",
    modality: "image",
    content: "Google Pay Paid ₹4,200.00 UPI Ref No: 555666777888 Debited from: HDFC Bank",
    language: "en",
    reporter: { mobile },
  });
  assert.equal(conflicted.state, "USER_CONFIRMATION", `expected conflict, got ${conflicted.state}`);
  const options = conflicted.nextAction.options || [];
  assert.ok(options.length >= 2, "Core must return the actual conflict values");
  assert.ok(
    options.every((opt) => Number(opt.value) !== 5000 && Number(opt.value) !== 50000),
    "conflict must not be the old hardcoded 5000/50000 pair"
  );

  const waTurn = await env.wa.handleIncomingMessage({
    From: `whatsapp:${mobile}`,
    Body: "1",
    MessageSid: "WA-CONFLICT-1",
    language: "en",
  });
  const chosen = Number(options[0].value);
  const incident = await env.incidentService.getIncident(waTurn.incidentId!);
  assert.equal(incident?.transaction?.amount, chosen, "WhatsApp must apply Core option 1, not a hardcoded amount");

  env.cleanup();
  console.log(`  ✓ conflict options from Core (${options.map((o) => o.value).join(" vs ")})`);
}

async function testWebThenWhatsAppSameCase(): Promise<void> {
  const env = await isolated();
  const mobile = "+919833344455";

  const web = await env.processService.processInput({
    source: "web",
    modality: "text",
    content: "Electricity scam. Paid ₹5000 via PhonePe from State Bank of India UTR 423456789012",
    language: "en",
    reporter: { mobile, name: "Ramesh Kumar" },
  });

  const status = await env.wa.handleIncomingMessage({
    From: `whatsapp:${mobile}`,
    Body: `STATUS ${web.incidentId}`,
    MessageSid: "WA-ID-1",
  });
  assert.equal(status.incidentId, web.incidentId);
  assert.equal(normalizeMobile(mobile), "919833344455");

  env.cleanup();
  console.log(`  ✓ Web → WhatsApp same incident ${web.incidentId}`);
}

async function testTwilioSignatureAndForm(): Promise<void> {
  const env = await isolated();
  const prevToken = process.env.TWILIO_AUTH_TOKEN;
  const prevValidate = process.env.TWILIO_VALIDATE_SIGNATURE;
  const prevUrl = process.env.TWILIO_WEBHOOK_URL;
  process.env.TWILIO_AUTH_TOKEN = "test-whatsapp-token";
  process.env.TWILIO_VALIDATE_SIGNATURE = "true";

  const server = createServer((req, res) => handleWhatsAppRequest(req, res, env.wa));
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address();
  assert.ok(addr && typeof addr === "object");
  const port = addr.port;
  const webhookUrl = `http://127.0.0.1:${port}/whatsapp/webhook`;
  process.env.TWILIO_WEBHOOK_URL = webhookUrl;

  const params = {
    From: "whatsapp:+919844455566",
    Body: "STATUS",
    MessageSid: "WA-SIG-1",
  };
  const bad = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Twilio-Signature": "not-a-real-signature",
    },
    body: new URLSearchParams(params).toString(),
  });
  assert.equal(bad.status, 403);

  const signature = computeTwilioSignature("test-whatsapp-token", webhookUrl, params);
  const good = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Twilio-Signature": signature,
    },
    body: new URLSearchParams(params).toString(),
  });
  assert.equal(good.status, 200);
  assert.match(String(good.headers.get("content-type")), /xml/);
  const twiml = await good.text();
  assert.match(twiml, /<Response><\/Response>/);
  assert.ok(env.outbound.length >= 1, "form-urlencoded inbound must still send outbound");

  server.close();
  process.env.TWILIO_AUTH_TOKEN = prevToken;
  process.env.TWILIO_VALIDATE_SIGNATURE = prevValidate;
  process.env.TWILIO_WEBHOOK_URL = prevUrl;
  env.cleanup();
  console.log("  ✓ Twilio signature reject/accept + form-urlencoded + empty TwiML");
}

async function testDeployedDeskUrls(): Promise<void> {
  const prevOrigin = process.env.PROTOCOL_PUBLIC_ORIGIN;
  const prevA = process.env.PORTAL_A_BASE_URL;
  const prevB = process.env.PORTAL_B_BASE_URL;
  delete process.env.PORTAL_A_BASE_URL;
  delete process.env.PORTAL_B_BASE_URL;
  process.env.PROTOCOL_PUBLIC_ORIGIN = "https://raksha-protocol.onrender.com";

  try {
    const desks = resolveDeskUrls();
    assert.equal(desks.portalA, "https://raksha-protocol.onrender.com/portal-a");
    assert.equal(desks.portalB, "https://raksha-protocol.onrender.com/portal-b");

    process.env.PORTAL_A_BASE_URL = "http://localhost:3003";
    process.env.PORTAL_B_BASE_URL = "http://localhost:3004";
    const ignoreLocalhost = resolveDeskUrls();
    assert.equal(ignoreLocalhost.portalA, "https://raksha-protocol.onrender.com/portal-a");
    assert.equal(ignoreLocalhost.portalB, "https://raksha-protocol.onrender.com/portal-b");

    const env = await isolated();
    const mobile = "+919877788899";
    const opened = await env.processService.processInput({
      source: "whatsapp",
      modality: "text",
      content: "Electricity scam. Paid ₹5000 via PhonePe from State Bank of India UTR 423456789012",
      language: "en",
      reporter: { mobile },
    });
    await env.actionRouter.executeAction(
      "report_financial_fraud",
      opened.incident,
      `desk-${opened.incidentId}`
    );
    const status = await env.wa.handleIncomingMessage({
      From: `whatsapp:${mobile}`,
      Body: `STATUS ${opened.incidentId}`,
      MessageSid: "WA-DESK-STATUS",
    });
    assert.match(status.replyText, /https:\/\/raksha-protocol\.onrender\.com\/portal-a/);
    assert.match(status.replyText, /https:\/\/raksha-protocol\.onrender\.com\/portal-b/);
    assert.doesNotMatch(status.replyText, /localhost:300[34]/);
    env.cleanup();
    console.log("  ✓ deployed WhatsApp desks use Render portal-a / portal-b, not localhost");
  } finally {
    if (prevOrigin === undefined) delete process.env.PROTOCOL_PUBLIC_ORIGIN;
    else process.env.PROTOCOL_PUBLIC_ORIGIN = prevOrigin;
    if (prevA === undefined) delete process.env.PORTAL_A_BASE_URL;
    else process.env.PORTAL_A_BASE_URL = prevA;
    if (prevB === undefined) delete process.env.PORTAL_B_BASE_URL;
    else process.env.PORTAL_B_BASE_URL = prevB;
  }
}

async function testGatewayWiresHandoff(): Promise<void> {
  const { createUnifiedGatewayServer } = await import("../scripts/prod-server.js");
  unwireWhatsAppHandoffSubscriber();
  const server = createUnifiedGatewayServer();
  assert.ok(server);
  server.close();
  unwireWhatsAppHandoffSubscriber();
  console.log("  ✓ unified gateway wires WhatsApp incident.accepted subscriber");
}

async function run(): Promise<void> {
  console.log("\n====================================================");
  console.log("  WhatsApp Real Edge — Acceptance");
  console.log("====================================================\n");

  await testHiDoesNotSelectHindi();
  await testEnglishStoryDoesNotReaskContext();
  await testRestartDoesNotReaskLanguage();
  await testLanguageThenCapLoop();
  await testConflictFromCoreNotHardcoded();
  await testWebThenWhatsAppSameCase();
  await testTwilioSignatureAndForm();
  await testDeployedDeskUrls();
  await testGatewayWiresHandoff();

  console.log("\n====================================================");
  console.log("  ALL WHATSAPP REAL-EDGE CHECKS PASSED");
  console.log("====================================================\n");
}

run().catch((err) => {
  console.error("whatsapp-edge failure:", err);
  process.exit(1);
});
