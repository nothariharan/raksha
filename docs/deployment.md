# Raksha Deployment Guide

## Production Architecture

The public website and the protocol host are separate so visitors never wait on a Render cold start for the first paint.

```text
Vercel (citizen website)
└── /, /how, /agents, /cap, /app, /demo, /images/*
    /app talks to the protocol origin over HTTPS + CORS

Render (protocol host) — https://raksha-protocol.onrender.com
├── /v1/*            Core incident & extraction engine
├── /cap/*, /api/cap Civic Action Protocol
├── /portal-a        Mock 1930 intake
├── /portal-b        Mock bank response
├── /whatsapp/*      WhatsApp webhook adapter
├── /phone/*         Telephony / ElevenLabs adapter
├── /mcp/*           Model Context Protocol server
└── /health          Liveness

Render Postgres (singapore)
└── Persistent incident, evidence, CAP, and audit storage
```

Marketing HTML is pre-rendered at build time (`pnpm export:web`) and served from Vercel’s CDN. Render keeps a long-running Node gateway for APIs and webhooks. If `PUBLIC_WEB_ORIGIN` is set, Render 302s human page routes to Vercel and keeps serving APIs on the same host.

---

## Environment Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Safety Variables

- `DEMO_MODE=true`
- `REAL_GOVERNMENT_INTEGRATION=false`

When `REAL_GOVERNMENT_INTEGRATION` is false, Raksha prefixes external references with `1930-SYN-`.

### Production hosts

- `PROTOCOL_PUBLIC_ORIGIN=https://raksha-protocol.onrender.com`
- `PUBLIC_WEB_ORIGIN=https://<vercel-production-host>` (set on Render after the Vercel project is live)

---

## Deploy

Website (from repo root):

```bash
pnpm export:web
vercel --prod --yes
```

Protocol: Render auto-deploys `chore/production-deployment` for `raksha-protocol`. After merging WhatsApp edge to `main`, fast-forward that branch (or retarget the service) so the live host serves `/whatsapp/webhook`.

### Twilio WhatsApp (live pilot)

On the Render service, set live `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Blueprint already sets:

- `TWILIO_WEBHOOK_URL=https://raksha-protocol.onrender.com/whatsapp/webhook`
- `TWILIO_VALIDATE_SIGNATURE=true`

In the Twilio console, the WhatsApp sandbox "When a message comes in" URL must be that same path (`HTTP POST`). Keep the webhook on Render, not Vercel.
