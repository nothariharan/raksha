# Raksha (रक्षा) — Autonomous Emergency Incident Protocol

> **Multimodal Emergency Public-Service Protocol for Financial Cyber-Fraud Reporting**  
> Backed by a deterministic incident engine, an Evidence Capsule with SHA-256 integrity verification, and the Civic Action Protocol (CAP) for service & agent interoperability.

---

## 🏛️ Overview

When a citizen loses money in a cyber fraud, they face the **Golden Hour (0–120 minutes)** where recovery rates exceed 90% if bank debit liens are placed rapidly. In acute panic, victims struggle with complex 15-screen portals and cannot locate 12-digit UTR numbers.

**Raksha transforms emergency interaction:**
- **Multimodal Panic Intake:** Speak in Hindi/English/Tamil/regional languages or drop a payment screenshot.
- **Deterministic Validation:** Schema checks, contradiction detection, and single-question clarification.
- **Evidence Capsule:** Original synthetic evidence sealed with SHA-256 digest.
- **Civic Action Protocol (CAP):** Typed machine-readable civic actions linking intake portals (Portal A), financial responder consoles (Portal B), and autonomous AI agents (MCP).

---

## 📂 Monorepo Structure

```text
raksha/
├── apps/
│   ├── web/           # Citizen emergency interface (Next.js UI)
│   ├── portal-a/      # Cyber Fraud Intake Portal (1930 / NCRP prototype)
│   └── portal-b/      # Financial Institution Response Console
│
├── services/
│   ├── core/          # Canonical incident engine & deterministic validation
│   └── cap/           # Civic Action Protocol router & capability registry
│
├── packages/
│   ├── schemas/       # Shared canonical TypeScript contracts (Incident, CAP, Events)
│   ├── cap-sdk/       # CAP Client SDK for services & portals
│   ├── i18n/          # Multilingual localization (EN, HI, TA, TE, KN, BN, MR)
│   └── shared/        # Shared event bus, ID generators, and hashing utilities
│
├── agents/
│   ├── whatsapp/      # WhatsApp webhook & conversation adapter
│   ├── phone/         # Telephony & voice first-responder adapter
│   └── mcp/           # Model Context Protocol (MCP) server for AI agents
│
├── docs/              # Architectural specifications & problem statements
├── test/              # End-to-end integration tests
├── .env.example       # Environment template
└── package.json       # Monorepo configuration (pnpm workspace)
```

---

## 🚀 Quickstart & Development

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Typecheck & Tests
```bash
pnpm typecheck
pnpm test
pnpm test:e2e:cap
```

### 3. Build All Packages & Services
```bash
pnpm build
```

### 4. Run Services Locally
```bash
# Core Backend API (:3001)
pnpm dev:core

# CAP Service (:3002)
pnpm dev:cap

# Portal A Intake (:3003)
pnpm dev:portal-a
```

---

## 📜 Phase Roadmap

- **PHASE 0** → Repository + contracts + End-to-End skeleton *(Completed)*
- **PHASE 1** → Core backend + database
- **PHASE 2** → Incident engine + deterministic validation
- **PHASE 3** → CAP
- **PHASE 4** → Portal integration
- **PHASE 5** → Web UI
- **PHASE 6** → WhatsApp
- **PHASE 7** → Phone
- **PHASE 8** → MCP / AI-agent interface
- **PHASE 9** → Full integration
- **PHASE 10** → UI polish + multilingual + demo hardening
