# Raksha Deployment Guide

## Production Architecture

```text
Vercel
└── apps/web (Citizen UI + Developer Console)

Render / Railway
├── services/core (Core Incident & Extraction Engine)
├── services/cap (Civic Action Protocol Server)
├── agents/whatsapp (WhatsApp Webhook Adapter)
├── agents/phone (Telephony / ElevenLabs Adapter)
└── agents/mcp (Model Context Protocol Server)

Supabase / Managed PostgreSQL
└── Persistent database & evidence storage
```

---

## Environment Configuration

Copy `.env.example` to `.env.local` for local development or `.staging.env` for staging:

```bash
cp .env.example .env.local
```

### Safety Variables
- `DEMO_MODE=true`
- `REAL_GOVERNMENT_INTEGRATION=false`

When `REAL_GOVERNMENT_INTEGRATION` is false, Raksha strictly prefixes all external references with `1930-SYN-` to enforce honest simulation boundaries.
