# Raksha — Staging & Deployment Architecture

This document describes the deployment topology for **Raksha Core, CAP Service, and Synthetic Portals** across local, staging, and demo environments.

---

## 🏗️ Topology Overview

```text
                     STAGING / DEMO ENVIRONMENT

Web (Vercel) ──────────┐
                       │
WhatsApp Webhook ──────┼───────► Render Web Service
                       │         (Raksha Core + CAP Engine)
Phone Telephony ───────┘                 │
                                         ▼
                                Supabase PostgreSQL
                                 + Storage Bucket
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
                     Portal A                        Portal B
                   (Intake UI)                     (Bank Console)
```

---

## ⚙️ Environment Configuration

### Local Development (`.env.local`)
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/raksha
CAP_PUBLIC_BASE_URL=http://localhost:3002
CORE_BASE_URL=http://localhost:3001
PORTAL_A_BASE_URL=http://localhost:3003
PORTAL_B_BASE_URL=http://localhost:3004
```

### Staging / Render (`.env.staging`)
```ini
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
CAP_INTERNAL_SECRET=[YOUR-SECURE-SECRET]
CAP_PUBLIC_BASE_URL=https://raksha-cap-staging.onrender.com
CORE_BASE_URL=https://raksha-core-staging.onrender.com
```

---

## 🗄️ Database Provisioning (Supabase / Postgres)

1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and execute the DDL script from [`services/core/db/schema.sql`](../services/core/db/schema.sql).
4. Copy the **Transaction Pooler** connection string into `DATABASE_URL`.

---

## 🚀 Service Start Commands

```bash
# Core API
pnpm --filter @raksha/core start

# CAP Engine
pnpm --filter @raksha/cap start

# Portal A
pnpm --filter @raksha/portal-a start

# Portal B
pnpm --filter @raksha/portal-b start
```
