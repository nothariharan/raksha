/**
 * Voice / phone proof policy:
 *   a spoken 12-digit UTR + amount is enough to confirm and file
 *   web/text still asks for a screenshot after confirm
 *   the original spoken story is not replaced by a later UTR
 *
 * Run: pnpm exec tsx test/voice-edge.test.ts
 */

import assert from "node:assert/strict";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import {
  DatabaseClient,
  IdentityAllocator,
  IncidentRepository,
  IncidentService,
  ProcessService,
} from "@raksha/core";
import { PhoneToolsHandler } from "@raksha/agent-phone";
import { globalEventBus, resetCounters } from "@raksha/shared";

const ROOT = join(process.cwd(), ".data", "voice-edge");
process.env.FORCE_FILE_DB = "true";
process.env.CAP_MODE = "in-memory";
delete process.env.GEMINI_API_KEY;

function wipe(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

async function isolated() {
  mkdirSync(ROOT, { recursive: true });
  const dbPath = join(ROOT, `voice-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
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
  return { dbPath, incidentService, processService, cleanup: () => wipe(dbPath) };
}

async function testVoiceWithoutUtrStaysOpen(): Promise<void> {
  const env = await isolated();
  const first = await env.processService.processInput({
    source: "phone",
    modality: "voice",
    content: "Someone asked me to pay five thousand rupees for tax and I got scammed from SBI",
    language: "en",
    reporter: { mobile: "+919811100001" },
  });
  assert.ok(first.incidentId);
  assert.notEqual(first.nextAction.nextActionType, "READY_FOR_HANDOFF");
  assert.match(first.nextAction.prompt || "", /UTR|12-digit|reference/i);
  env.cleanup();
  console.log("  ✓ voice story without UTR asks for UTR, does not file");
}

async function testVoiceUtrIsSpokenProof(): Promise<void> {
  const env = await isolated();
  const opened = await env.processService.processInput({
    source: "phone",
    modality: "voice",
    content:
      "I was scammed on a tax call. I paid 5000 rupees from State Bank of India UTR 123456789012",
    language: "en",
    reporter: { mobile: "+919811100002" },
  });
  assert.equal(opened.incident.transaction.amount, 5000);
  assert.equal(opened.incident.transaction.transactionId, "123456789012");
  assert.equal(opened.state, "READY");

  const confirmed = await env.processService.processInput({
    incidentId: opened.incidentId,
    source: "phone",
    modality: "voice",
    content: "yes confirm these details",
    language: "en",
    confirmFacts: true,
    reporter: { mobile: "+919811100002" },
  });
  assert.equal(confirmed.nextAction.nextActionType, "READY_FOR_HANDOFF");
  assert.notEqual(confirmed.nextAction.nextActionType, "ASK_PROOF");
  env.cleanup();
  console.log("  ✓ voice amount + UTR is spoken proof; confirm does not ask for a screenshot");
}

async function testWebStillAsksScreenshot(): Promise<void> {
  const env = await isolated();
  const opened = await env.processService.processInput({
    source: "web",
    modality: "text",
    content:
      "I was scammed on a tax call. I paid 5000 rupees from State Bank of India UTR 123456789012",
    language: "en",
    reporter: { mobile: "+919811100003" },
  });
  const confirmed = await env.processService.processInput({
    incidentId: opened.incidentId,
    source: "web",
    modality: "text",
    content: "Citizen confirmed the gathered details.",
    language: "en",
    confirmFacts: true,
    reporter: { mobile: "+919811100003" },
  });
  assert.equal(confirmed.nextAction.nextActionType, "ASK_PROOF");
  env.cleanup();
  console.log("  ✓ web confirm still asks for a payment screenshot");
}

async function testVoiceKeepsOriginalStory(): Promise<void> {
  const env = await isolated();
  const opened = await env.processService.processInput({
    source: "phone",
    modality: "voice",
    content: "so i was asked to pay 5000 ruppees to a person with regard to tax but then realised i got scammed",
    language: "en",
    reporter: { mobile: "+919811100004" },
  });
  const follow = await env.processService.processInput({
    incidentId: opened.incidentId,
    source: "phone",
    modality: "voice",
    content: "123456789012 from SBI",
    language: "en",
    reporter: { mobile: "+919811100004" },
  });
  assert.match(follow.incident.narrative.text, /tax|scammed/i);
  assert.doesNotMatch(follow.incident.narrative.text, /^123456789012/);
  env.cleanup();
  console.log("  ✓ later spoken UTR does not replace the original story");
}

async function testPhoneRefusesFileWithoutUtr(): Promise<void> {
  const env = await isolated();
  const opened = await env.processService.processInput({
    source: "phone",
    modality: "voice",
    content: "I got scammed and paid 5000 from SBI",
    language: "en",
    reporter: { mobile: "+919811100005" },
  });
  const phone = new PhoneToolsHandler({
    incidentLookup: (id) => env.incidentService.getIncident(id),
    processInput: (input) => env.processService.processInput(input),
  });
  const filed = await phone.submitIncident({ incidentId: opened.incidentId, language: "en" });
  assert.equal(filed.success, false);
  assert.match(filed.confirmationSpeech, /UTR|12-digit/i);
  env.cleanup();
  console.log("  ✓ phone submit without UTR is refused");
}

async function testPhoneSpokenYesConfirmsWhenUtrPresent(): Promise<void> {
  const env = await isolated();
  const phone = new PhoneToolsHandler({
    incidentLookup: (id) => env.incidentService.getIncident(id),
    processInput: (input) => env.processService.processInput(input),
  });
  const started = await phone.startIncident({
    narrative:
      "I was scammed on a tax call. I paid 5000 rupees from State Bank of India UTR 123456789012",
    callerPhone: "+919811100006",
    language: "en",
  });
  assert.equal(started.isReady, true);
  const confirmed = await phone.processUserInput({
    incidentId: started.incidentId,
    userSpeech: "yes",
    isConfirmation: true,
    language: "en",
    callerPhone: "+919811100006",
  });
  assert.equal(confirmed.isReady, true);
  const filed = await phone.submitIncident({ incidentId: started.incidentId, language: "en" });
  assert.equal(filed.success, true);
  assert.match(filed.officialReference, /1930-SYN-/);
  env.cleanup();
  console.log("  ✓ phone confirm + UTR can file; spoken yes reaches Core");
}

async function testLanguagePickDoesNotOpenCase(): Promise<void> {
  const env = await isolated();
  let coreHits = 0;
  const phone = new PhoneToolsHandler({
    incidentLookup: (id) => env.incidentService.getIncident(id),
    processInput: async (input) => {
      coreHits += 1;
      return env.processService.processInput(input);
    },
  });
  const started = await phone.startIncident({
    narrative: "English is fine",
    callerPhone: "+919811100007",
    language: "en",
  });
  assert.equal(started.incidentId, "");
  assert.match(started.promptForCaller, /English/i);
  const follow = await phone.processUserInput({
    userSpeech: "I prefer English",
    callerPhone: "+919811100007",
    language: "en",
  });
  assert.equal(follow.incidentId, "");
  assert.equal(coreHits, 0);
  env.cleanup();
  console.log("  ✓ language pick does not open a Core incident");
}

async function run(): Promise<void> {
  console.log("\n====================================================");
  console.log("  Voice / Phone Proof — Acceptance");
  console.log("====================================================\n");
  await testVoiceWithoutUtrStaysOpen();
  await testVoiceUtrIsSpokenProof();
  await testWebStillAsksScreenshot();
  await testVoiceKeepsOriginalStory();
  await testPhoneRefusesFileWithoutUtr();
  await testPhoneSpokenYesConfirmsWhenUtrPresent();
  await testLanguagePickDoesNotOpenCase();
  console.log("\n====================================================");
  console.log("  ALL VOICE PROOF CHECKS PASSED");
  console.log("====================================================\n");
}

run().catch((err) => {
  console.error("voice-edge failure:", err);
  process.exit(1);
});
