# Raksha testing

This folder holds automated protocol tests (`*.ts`) and the playbooks for the current `/app` proof-gate work.

| File | Who | What |
|---|---|---|
| [HUMAN.md](./HUMAN.md) | Person at a browser / phone / WhatsApp | Voice, UI, proof upload, desk links, mobile layout |
| [AGENT.md](./AGENT.md) | Coding agent or CI | Commands, HTTP contracts, extraction, no-reuse, CAP chain |

Simulated demo only. No real 1930 filing. No real bank freeze.

## Start the stack

From the repo root:

```bash
pnpm demo:reset
pnpm demo
```

`demo:reset` wipes the local file store under `.data/` so leftover `READY` cases do not leak into a new run. `pnpm demo` keeps existing state.

| Service | URL |
|---|---|
| Web `/app` | http://localhost:3000/app |
| Core | http://localhost:3001 |
| CAP | http://localhost:3002 |
| Portal A (1930 desk) | http://localhost:3003 |
| Portal B (bank freeze desk) | http://localhost:3004 |
| WhatsApp webhook | http://localhost:3005 |
| Phone / simulate | http://localhost:3006 |
| MCP | http://localhost:3007 |

Hard-refresh `/app` after a restart (`Ctrl+Shift+R`).

## Local secrets (not in git)

`.env.local` must have a real Fireworks key for screenshot verification:

```
FIREWORKS_API_KEY=fw_...
FIREWORKS_VISION_MODEL=accounts/fireworks/models/glm-5p3-flash
```

`.env.example` only has placeholders. Do not commit `.env.local`.

## Demo proof images

Use these on the proof step (they are ordinary receipts, no scam wording):

- `apps/web/public/images/demo-proof/demo-proof-upi-phonepe.png` — PhonePe ₹4,850, UTR `427891036542`
- `apps/web/public/images/demo-proof/demo-proof-netbanking.png` — bank transfer $1,250, txn `#7842915`
- `apps/web/public/images/demo-proof/demo-proof-sms-imps.png` — Axis IMPS SMS (optional third image)

## Split of work

**Human** owns anything that needs ears, eyes, or a real ElevenLabs session: language lock, spoken audio, dossier matching the *current* conversation, card layout on phone width, opening Portal A/B in a tab.

**Agent** owns anything that is a command, JSON contract, or file-backed extractor: `pnpm test*`, Fireworks smoke scripts, `POST /v1/process` with `forceNew`, confirm → proof → CAP without a browser.

Both playbooks list fail conditions. If a human fail happens, fix before demoing. If an agent fail happens, do not treat the stack as green.
