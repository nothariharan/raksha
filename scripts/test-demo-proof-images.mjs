/**
 * Test demo proof images through GLM vision + Core /v1/process proof gate.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnv } from "../packages/shared/dist/env.js";
import { VisionFireworksExtractor } from "../services/core/dist/extraction/vision-fireworks.js";

loadEnv(process.cwd());

const CORE = process.env.CORE_URL || "http://localhost:3001";
const DIR = join(process.cwd(), "apps/web/public/images/demo-proof");

const FILES = [
  { name: "demo-proof-upi-phonepe.png", expect: { amount: 4850, utr: "427891036542" } },
  { name: "demo-proof-netbanking.png", expect: { amount: 1250 } },
];

function toDataUrl(file) {
  const buf = readFileSync(join(DIR, file));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function processOnce(body) {
  const res = await fetch(`${CORE}/v1/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`process ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`process ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return json;
}

console.log("=== VISION EXTRACTOR (glm-5p3-flash) ===");
for (const f of FILES) {
  const result = await VisionFireworksExtractor.extract({
    modality: "image",
    content: toDataUrl(f.name),
    sourceId: f.name,
    language: "en",
  });
  console.log(
    JSON.stringify(
      {
        file: f.name,
        source: result.source,
        readable: result.readable,
        warning: result.warning || null,
        amount: result.candidate.amount ?? null,
        utr: result.candidate.transactionId ?? null,
        app: result.candidate.application ?? null,
        bank: result.candidate.debitInstitution ?? null,
        summary: (result.candidate.narrative || "").slice(0, 160),
      },
      null,
      2,
    ),
  );
  if (result.source !== "fireworks" || !result.readable) {
    console.error(`FAIL_VISION ${f.name}`);
    process.exit(2);
  }
}

console.log("\n=== CORE PROOF GATE (UPI image) ===");
const intake = await processOnce({
  source: "web",
  modality: "text",
  language: "en",
  content:
    "I lost money in an electricity bill scam. I paid 4850 rupees via PhonePe from HDFC Bank. UTR is 427891036542. The scammer asked me to pay on PhonePe to Rohan Mehta.",
  reporter: { mobile: "919876543210", name: "Demo Citizen" },
});
console.log(
  JSON.stringify(
    {
      step: "intake",
      id: intake.incidentId,
      state: intake.state,
      next: intake.nextAction?.nextActionType,
      amount: intake.incident?.transaction?.amount,
      utr: intake.incident?.transaction?.transactionId,
    },
    null,
    2,
  ),
);

let incidentId = intake.incidentId;
let state = intake.state;
let next = intake.nextAction;

// Answer clarifications until confirm / ready / ask_proof
for (let i = 0; i < 6; i++) {
  if (next?.nextActionType === "CONFIRM_FACTS" || next?.nextActionType === "ASK_PROOF" || state === "READY") break;
  if (next?.nextActionType !== "ASK_USER" || !next.field) break;
  const answers = {
    fraudCategory: "ELECTRICITY_BILL_SCAM",
    scamSummary: "Fake electricity disconnection call asking for PhonePe payment",
    amount: 4850,
    transactionId: "427891036542",
    debitInstitution: "HDFC Bank",
    application: "PhonePe",
  };
  const ans = answers[next.field] ?? "ELECTRICITY_BILL_SCAM";
  const r = await processOnce({
    incidentId,
    source: "web",
    modality: "text",
    language: "en",
    content: String(ans),
    userClarificationAnswer: { field: next.field, answerValue: ans },
  });
  incidentId = r.incidentId;
  state = r.state;
  next = r.nextAction;
  console.log(
    JSON.stringify(
      {
        step: `clarify:${next?.field || r.nextAction?.nextActionType}`,
        state: r.state,
        next: r.nextAction?.nextActionType,
        fieldAsked: next?.field,
        proofVerified: !!r.incident?.validation?.proofVerified,
        factsConfirmed: !!r.incident?.validation?.factsConfirmed,
      },
      null,
      2,
    ),
  );
  next = r.nextAction;
}

const confirm = await processOnce({
  incidentId,
  source: "web",
  modality: "text",
  language: "en",
  content: "",
  confirmFacts: true,
});
console.log(
  JSON.stringify(
    {
      step: "confirmFacts",
      state: confirm.state,
      next: confirm.nextAction?.nextActionType,
      factsConfirmed: !!confirm.incident?.validation?.factsConfirmed,
      proofVerified: !!confirm.incident?.validation?.proofVerified,
    },
    null,
    2,
  ),
);

const proof = await processOnce({
  incidentId,
  source: "web",
  modality: "image",
  language: "en",
  content: toDataUrl("demo-proof-upi-phonepe.png"),
});
console.log(
  JSON.stringify(
    {
      step: "uploadProof",
      state: proof.state,
      next: proof.nextAction?.nextActionType,
      factsConfirmed: !!proof.incident?.validation?.factsConfirmed,
      proofVerified: !!proof.incident?.validation?.proofVerified,
      amount: proof.incident?.transaction?.amount,
      utr: proof.incident?.transaction?.transactionId,
      canFile:
        !!proof.incident?.validation?.factsConfirmed &&
        !!proof.incident?.validation?.proofVerified,
    },
    null,
    2,
  ),
);

if (!proof.incident?.validation?.proofVerified) {
  console.error("PROOF_NOT_VERIFIED");
  process.exit(3);
}

console.log("\nPROOF_GATE_OK — vision verified UPI; ready for CAP filing after confirm+proof");
