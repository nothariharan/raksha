# Agent testing

Run these from the repo root. Do not ask a human to click through JSON or watch a terminal for these. Use `pnpm demo` (or in-process tests that boot their own store) as noted.

Do not print or commit `.env.local` or any `FIREWORKS_API_KEY`.

## 0. Build and typecheck

```bash
pnpm build
pnpm typecheck
```

Both must exit 0 before you call the stack green.

## 1. Existing protocol suites (must pass)

These live in this same `test/` folder. They do **not** replace the human `/app` voice pass.

```bash
pnpm test
pnpm test:cross-channel
pnpm test:cap-handoff
pnpm test:thesis
pnpm test:persistence
```

| Command | What it proves |
|---|---|
| `pnpm test` | CAP e2e (`test/run-e2e.ts`) |
| `pnpm test:cross-channel` | Same mobile resumes the same `RKS-*` across channels for an *in-progress* case |
| `pnpm test:cap-handoff` | Confirm → CAP execute is idempotent |
| `pnpm test:thesis` | Full autonomous chain: process → confirm → CAP → portals → WhatsApp STATUS → phone/web resume |
| `pnpm test:persistence` | File/Postgres identity + cold start |

**Fail:** any non-zero exit. Do not “skip” thesis because `/app` UI changed. If a test still assumes READY+YES files without `factsConfirmed` on web, fix the test or the contract and say so.

## 2. Demo health

With `pnpm demo` running:

```bash
pnpm demo:check
```

Or:

```bash
curl -s http://localhost:3001/health
curl -s http://localhost:3000/health
```

Expect healthy / `ok`.

## 3. Fireworks vision smoke (needs real key in `.env.local`)

```bash
pnpm --filter @raksha/core build
node scripts/test-fireworks-vision.mjs
node scripts/test-fireworks-extractor.mjs
```

**Pass**
- `FIREWORKS_VISION_OK` with `accounts/fireworks/models/glm-5p3-flash` (or the pinned working vision model).
- `VISION_EXTRACTOR_OK` and `source: "fireworks"` (not `heuristic` / `empty_vision`).

**Fail**
- 404 model not deployed. Pin another *vision* model that returns JSON `content` (GLM 5.2 / `glm-5p2` on Fireworks is text-only).
- Empty `content` because `max_tokens` was eaten by reasoning.

## 4. Demo proof images + Core proof gate

Demo must be up. Core must have been built after vision changes.

```bash
node scripts/test-demo-proof-images.mjs
```

**Pass**
- UPI PNG: `readable: true`, amount `4850`, UTR `427891036542`, `source: fireworks`.
- Netbanking PNG: `readable: true`, amount `1250`.
- Process path: intake → `confirmFacts` → `ASK_PROOF` / `factsConfirmed: true` → image upload → `proofVerified: true` and `canFile: true`.

**Fail**
- `FAIL_VISION` or `PROOF_NOT_VERIFIED`.
- `confirmFacts` leaves `factsConfirmed: false` (validation wipe bug).

## 5. Fresh session vs leftover READY (must pass)

The default web mobile `+919876543210` used to reopen an old `READY` incident (₹4850 PhonePe). Agents must prove a **new narrative** creates a **new** `RKS-*`.

With demo up:

```http
POST http://localhost:3001/v1/process
Content-Type: application/json
```

```json
{
  "source": "web",
  "modality": "voice",
  "forceNew": true,
  "language": "en",
  "reporter": { "mobile": "+919876543210" },
  "content": "I got scammed on a medical government tax issue. I paid 5000 rupees from SBI Bank. The UTR number is 123456789012. I did not use PhonePe or any UPI app."
}
```

**Pass**
- New `incidentId` (not the leftover demo-proof case).
- `transaction.amount` = `5000`
- `transaction.debitInstitution` contains State Bank
- `transaction.transactionId` = `123456789012`
- `transaction.application` empty
- `transaction.channel` = `BANK_TRANSFER` (denied UPI)
- `narrative.text` / `scamSummary` is this medical/tax story

Without `forceNew`, a second long fraud narrative against the same mobile while a `READY` case exists must still start fresh (`shouldStartFreshIncident`). A short “status” / “continue” must **not** start fresh.

**Fail**
- Response amount `4850`, UTR `427891036542`, PhonePe, or electricity-bill narrative.

## 6. Confirm then proof contract

On the incident from §5 (state `READY`):

1. `POST /v1/process` with `incidentId`, `confirmFacts: true`, `modality: "text"`, `reporter.mobile` set.

**Pass (typed/web):** `validation.factsConfirmed === true`, `nextAction.nextActionType === "ASK_PROOF"`, `proofVerified === false`.

**Pass (voice, 12-digit UTR already on the incident):** same confirm with `modality: "voice"` must return `READY_FOR_HANDOFF` and `proofVerified: true`. Do not ask for a screenshot. `pnpm test:voice-edge` covers this. A 10-digit reference is not enough to file on a call.

2. `POST /v1/process` with same `incidentId`, `modality: "image"`, `content` = raw base64 of `demo-proof-upi-phonepe.png` (or data URL).

**Pass:** `validation.proofVerified === true`, `nextAction.nextActionType === "READY_FOR_HANDOFF"`. Spoken narrative must still be the medical/tax story (receipt summary must not replace it).

3. `POST {CAP}/cap/actions/execute` with `action: "report_financial_fraud"` and idempotency key `web-cap-{incidentId}` (same shape `/app` uses).

**Pass:** `externalReference` like `1930-SYN-*`. Incident moves toward `SUBMITTED` / `ACKNOWLEDGED`. Portal A (`:3003`) and Portal B (`:3004`) can resolve the case (GET their case APIs or HTML).

**Fail:** confirm flags wiped on `updateIncident`; image path skips vision and never sets `proofVerified`; CAP 4xx.

## 7. Extraction unit checks (no browser)

After `pnpm --filter @raksha/core build`, a short node script or existing extractor tests should cover:

| Input snippet | Expect |
|---|---|
| `paid 5,000 rupees` / `five thousand` | amount `5000` |
| `UTR number is 1234567890` | transactionId `1234567890` (8–16 labeled digits, not only 12) |
| `SBI Bank` | State Bank of India |
| `I did not use PhonePe or any UPI app` | not PhonePe, not channel UPI |

`glm-5p2` / `glm-5p3` (non-flash) rejecting images is expected. Do not “fix” by sending screenshots to text-only models.

## 8. WhatsApp / phone (agent, no UI)

If you can POST the local webhooks:

**WhatsApp** `POST http://localhost:3005/whatsapp/webhook` (or `/webhook`) with a normalized inbound text for a test mobile. New numbers must be asked for language before intake. Then a YES while session `lastState === READY`. Every turn must produce `replyText` and an outbound send (Twilio REST when live creds exist; captured in tests).

**Pass:** language gate → collect missing fields → CAP execute, reply text contains Portal A/B URLs, no `confirmFacts` / proof requirement. `pnpm test:whatsapp-edge` covers signature, form-urlencoded, restart hydrate, and Core conflict options.

**Phone** `POST http://localhost:3006/phone/simulate` with `start` → `speech` → `submit` (see `agents/phone`).

**Pass:** `submit_incident` hits CAP; spoken/result payload includes `portalAUrl` / `portalBUrl`.

If Twilio signatures block you, run `pnpm test:thesis` / `pnpm test:cross-channel` instead and record that live Twilio was not exercised.

## 9. What agents must not treat as done

- A screenshot of `/app` idle. That is not a voice test.
- `pnpm test` green **without** §4–§6 if you changed vision, `forceNew`, or validation flags.
- Claiming Portals work without hitting `:3003` / `:3004` or the thesis/handoff tests.
- Pushing `.env.local` or a real Fireworks key.

## 10. Suggested agent order

1. `pnpm build && pnpm typecheck`
2. `pnpm test && pnpm test:cross-channel && pnpm test:cap-handoff && pnpm test:thesis && pnpm test:whatsapp-edge && pnpm test:voice-edge`
3. Start demo if not up
4. `node scripts/test-fireworks-extractor.mjs`
5. `node scripts/test-demo-proof-images.mjs`
6. `forceNew` process POST in §5
7. Confirm + image + CAP in §6
8. Hand the human playbook ([HUMAN.md](./HUMAN.md)) for ElevenLabs + layout + clicking the desks
