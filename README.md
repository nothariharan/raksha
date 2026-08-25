# 🛡️ Raksha — Multimodal Emergency Public-Service Protocol

> **One Civic Action • Four Convergent Interfaces (Web • WhatsApp • Phone • MCP Agents)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Protocol Version](https://img.shields.io/badge/Protocol-CAP%20v0.1-green.svg)](#civic-action-protocol)
[![Tests](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen.svg)](#automated-test-matrix)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## The Problem

When a citizen loses money to a cyber scam in India, the first **two golden hours** determine whether intermediate bank accounts can be frozen. Today, victims must navigate complex multi-step forms across separate government and banking portals while under intense distress. Meanwhile, emerging AI assistants cannot interact with public services safely without fragile browser scraping.

## The Solution: Raksha & CAP

**Raksha** is an emergency first-responder protocol for financial cyber-fraud reporting. It introduces the **Civic Action Protocol (CAP)** — a deterministic, machine-action layer enabling citizens and autonomous AI agents to initiate authorized public-service freeze packets through four unified front doors:

```text
       HUMAN INTERFACES                             AI INTERFACES
  ┌──────────┼──────────┐                                 │
  ▼          ▼          ▼                                 ▼
 Web      WhatsApp    Phone                      Autonomous AI Agents
 (UI)     (Twilio)  (ElevenLabs)                 (Claude / GPT / Scout)
  │          │          │                                 │
  │          │          │                         Model Context Protocol
  │          │          │                                 │
  │          │          │                                 ▼
  │          │          │                         [Raksha MCP Server]
  │          │          │                        • discover_capabilities
  │          │          │                        • start_incident
  │          │          │                        • add_evidence
  │          │          │                        • submit_incident (Guarded)
  │          │          │                                 │
  └──────────┼──────────┴─────────────────────────────────┘
             │
             ▼
      POST /v1/process
             │
             ▼
     [Raksha Core API]
     (Persistent Incident Repository & Deterministic Reconciliation)
             │
             ▼
     [Civic Action Protocol (CAP)]
     (Idempotent Action Router & Tamper-Evident Hashed Audit Ledger)
             │
     ┌───────┴───────┐
     ▼               ▼
  Portal A        Portal B
(1930 Intake)   (Bank Response)
```

---

## ⚡ Quick Start (One-Command Full Stack)

To reset the database to a clean state, seed the canonical demo persona (Ramesh Kumar, ₹5,000 SBI UPI), and launch all 8 services:

```bash
# 1. Install dependencies
pnpm install

# 2. Build and Typecheck
pnpm build
pnpm typecheck

# 3. Reset and Launch Full Protocol Stack
pnpm demo
```

### Protocol Service Map:
| Service | Endpoint | Description |
| :--- | :--- | :--- |
| **Citizen Web UI & Dev Drawer** | `http://localhost:3000` | Notion AI × Wispr Flow minimal emergency UX |
| **Raksha Core API** | `http://localhost:3001` | Multimodal reconciliation & incident state machine |
| **Civic Action Protocol (CAP)** | `http://localhost:3002` | Capability discovery, action routing & tamper-evident audit ledger |
| **Portal A (1930 Intake)** | `http://localhost:3003` | Mock citizen cybercrime intake portal |
| **Portal B (Bank Response)** | `http://localhost:3004` | Mock intermediary banking freeze & lien console |
| **WhatsApp Webhook Adapter** | `http://localhost:3005` | Twilio / Meta webhook message normalizer |
| **Voice Telephony Agent** | `http://localhost:3006` | ElevenLabs / Twilio / Exotel voicebot adapter |
| **Model Context Protocol (MCP)**| `http://localhost:3007` | JSON-RPC 2.0 public-service agent tool server |
| **System Health Overview** | `http://localhost:3001/system/health` | Comprehensive stack health check |

---

## 🧪 Automated Test Matrix (`pnpm test`)

Run the complete 10-scenario end-to-end integration and quad-channel convergence matrix:

```bash
pnpm test
```

```text
=================================================================
  RAKSHA PROTOCOL v0.7.0 — FINAL DEMO HARDENING & RELIABILITY
=================================================================

  ✓ Core Server running on http://localhost:3051
  ✓ CAP Server running on http://localhost:3052
  ✓ MCP Server running on http://localhost:3057

▶ [Scenario 1] Verifying System Health Check (GET /system/health)...
  ✓ System Health verified: HEALTHY (Protocol: cap/0.1, Version: 0.7.0)

▶ [Scenario 2] Executing Deterministic Demo Reset (pnpm demo:reset)...
  ✓ Demo reset confirmed: Canonical persona Ramesh Kumar (₹5,000) seeded in clean state.

▶ [Scenario 3] QUAD-CHANNEL EQUIVALENCE: Canonical Ramesh Kumar across 4 front doors...
  ✓ Web UI     : Amount ₹5000 | UTR 423456789012 | SBI
  ✓ WhatsApp   : Amount ₹5000 | UTR 423456789012 | SBI
  ✓ Phone      : Amount ₹5000 | UTR 423456789012 | SBI
  ✓ MCP Agent  : Amount ₹5000 | UTR 423456789012 | SBI
  ✓ 100% Cross-channel state parity verified.

▶ [Scenario 4] Testing Multilingual Full Journeys (Hindi & Tamil)...
  ✓ Hindi Voice Turn: "मुझे बस एक जानकारी चाहिए..."
  ✓ Tamil Intake Turn: "பரிவர்த்தனை விவரங்கள்..."

▶ [Scenario 5] Failure Mode 1: Discrepancy Detection (₹50k voice vs ₹5k screenshot)...
  ✓ Contradiction captured safely: Prompted citizen for choice without blind execution.

▶ [Scenario 6] Failure Mode 2: Downstream CAP Outage -> Graceful DEFERRED State...
  ✓ Zero-hallucination verified: Returned DEFERRED state during downstream outage.

▶ [Scenario 7] Verifying Tamper-Evident Hashed Audit Log & Evidence Digest...
  ✓ Tamper-evident evidence capsule digest calculated (SHA-256).

▶ [Scenario 8 & 9] Submitting Incident & Portal B Bank Lien Acknowledgment...
  ✓ Simulation Boundary Enforced: Reference = 1930-SYN-958303
  ✓ Portal B Bank Console acknowledged simulated lien.

▶ [Scenario 10] Testing Process Crash & Recovery of Persistent Database...
  ✓ Database verification: Incident intact with 100% fidelity.

=================================================================
  ALL 10 PHASE 7 FINAL HARMONIZATION TESTS PASSED (100% SUCCESS)
=================================================================
```

---

## 🏛️ Simulation Boundary & Claims Truthfulness

- **Simulated Demonstration**: Downstream actions to 1930 Cyber Cell (Portal A) and Bank Nodal Freeze (Portal B) are demonstration mocks conforming to real-world RFC-style CAP schemas.
- **Reference Labeling**: All generated case identifiers are strictly prefixed with `1930-SYN-` to make the simulation boundary obvious to judges and auditors.
- **Audit Integrity**: All state transitions record SHA-256 evidence digests in a tamper-evident hashed audit ledger.

---

## 📖 Architecture & Documentation

- [Full Architecture Specification](docs/architecture.md)
- [Civic Action Protocol (CAP) Contract](docs/cap-contract.md)
- [Live Demo Script & Guide](docs/demo.md)
- [Production Deployment Guide](docs/deployment.md)

---

## 📜 Thesis

> *"People shouldn't need to learn how government software works in an emergency. And AI agents shouldn't have to pretend government websites are APIs. Raksha gives both humans and agents one safe path to the same public-service action."*
