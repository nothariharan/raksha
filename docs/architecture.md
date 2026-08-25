# Raksha Architecture & Protocol Specification

## 1. Executive Summary

**Raksha** is an emergency public-service protocol and first-responder system for financial cyber-fraud reporting in India. It introduces the **Civic Action Protocol (CAP)** — a deterministic, machine-readable action layer that enables citizens (via Web, WhatsApp, and Voice Telephony) and autonomous AI agents (via Model Context Protocol) to trigger authorized public-service freeze actions without manual form-filling or brittle web scraping.

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
     (Persistent Incident Repository & Reconciliation Engine)
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

## 2. Core Architectural Principles

1. **One Civic Action, Four Interfaces**:
   Citizens and agents initiate the exact same state machine. An incident created via Hindi voice call on a phone can be reviewed on WhatsApp and tracked on the Web with identical data fidelity.
2. **Deterministic Reconciliation without LLM Guesswork**:
   Discrepancies (e.g. ₹50,000 voice vs ₹5,000 screenshot) are detected mathematically and surfaced as clear one-question clarification options rather than hallucinated compromises.
3. **Safety-Guarded Agent Tool Policy**:
   High-risk actions (`raksha_submit_incident`) strictly require explicit human confirmation (`confirmedByCitizen: true`).
4. **Idempotency & Tamper-Evident Audit Trails**:
   Every webhook retry and CAP action passes an `Idempotency-Key` preventing duplicate cases, while all state transitions are recorded with SHA-256 evidence digests.
5. **Clear Simulation Boundary**:
   All prototype downstream actions produce `1930-SYN-XXXXXX` references and explicit simulated demonstration labeling.
