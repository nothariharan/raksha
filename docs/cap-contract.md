# Civic Action Protocol (CAP) — Frozen Interface Specification v0.1

**Status:** FROZEN (Phase 0)  
**Protocol Version:** `raksha/0.1`  
**Governing Rule:** The portals and AI agents never talk directly to internal Raksha databases or services. They interact strictly through CAP.

---

## 1. Core Architecture Boundary

```
  Citizen / Human Interfaces          AI Agents / Automated Services
   (Web, WhatsApp, Phone)                    (MCP, REST)
             │                                    │
             ▼                                    ▼
      ┌──────────────┐                     ┌──────────────┐
      │ Raksha Core  │                     │  MCP Server  │
      └──────┬───────┘                     └──────┬───────┘
             │                                    │
             └──────────────────┬─────────────────┘
                                │
                                ▼
                   ┌──────────────────────────┐
                   │           CAP            │
                   │ (Civic Action Protocol)  │
                   └────────────┬─────────────┘
                                │
                  ┌─────────────┴─────────────┐
                  ▼                           ▼
            ┌────────────┐              ┌────────────┐
            │  Portal A  │              │  Portal B  │
            │(Cybercrime)│              │(Fin. Inst.)│
            └────────────┘              └────────────┘
```

---

## 2. Shared Types & Contracts

### 2.1 Canonical Fraud Incident (`packages/schemas/src/incident.ts`)

```typescript
export interface FraudIncident {
  id: string; // e.g. "RKS-000001"
  protocolVersion: "raksha/0.1";
  type: "FINANCIAL_CYBER_FRAUD";
  narrative: {
    text: string;
    source: "web" | "whatsapp" | "phone" | "agent" | "mcp";
  };
  reporter: {
    mobile?: string;
    name?: string;
    preferredLanguage?: string;
    state?: string;
    district?: string;
  };
  transaction: {
    amount?: number;
    currency?: string;
    transactionId?: string; // 12-digit UTR / RRN
    timestamp?: string; // ISO-8601
    debitInstitution?: string;
    beneficiaryIdentifier?: string; // UPI VPA / A/c
    beneficiaryInstitution?: string;
    channel?: "UPI" | "CARD" | "BANK_TRANSFER" | "WALLET" | "NET_BANKING" | "OTHER";
  };
  evidence: string[]; // Array of EvidenceReference IDs ("EV-001")
  state: IncidentState;
  validation: IncidentValidation;
  handoff: IncidentHandoff;
  createdAt: string;
  updatedAt: string;
}
```

### 2.2 Evidence Reference & Capsule (`packages/schemas/src/evidence.ts`)

```typescript
export interface EvidenceReference {
  id: string; // "EV-001"
  incidentId: string;
  type: "TRANSACTION_SCREENSHOT" | "VOICE_STATEMENT" | "SMS_TEXT" | "BANK_STATEMENT" | "DOCUMENT";
  uri: string;
  sha256: string;
  mimeType?: string;
  capturedAt: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceCapsule {
  incidentId: string;
  protocolVersion: string;
  sealedAt: string;
  items: EvidenceReference[];
  hashDigest: string; // Aggregate SHA-256 over all items
}
```

### 2.3 CAP Action Operations (`packages/schemas/src/cap.ts`)

Standard Actions:
1. `report_financial_fraud`: Submits incident to intake portal.
2. `attach_evidence`: Attaches evidence references and SHA-256 hashes.
3. `acknowledge_response`: Financial institution marks lien or accounts freeze.
4. `get_case`: Queries case status.
5. `get_case_events`: Fetches audit log.

### 2.4 Event Bus Specification (`packages/schemas/src/events.ts`)

```typescript
export interface CAPEvent<T = unknown> {
  id: string; // "EVT-000001"
  type:
    | "incident.created"
    | "incident.ready"
    | "incident.submitted"
    | "incident.accepted"
    | "response.acknowledged"
    | "evidence.sealed"
    | "case.updated";
  caseId: string;
  incidentId?: string;
  source: string;
  timestamp: string;
  payload: T;
}
```

---

## 3. Endpoints & REST API

### Core Service (`:3001`)
- `POST /v1/incidents` — Create canonical incident
- `GET  /v1/incidents` — List all incidents
- `GET  /v1/incidents/:id` — Retrieve specific incident
- `POST /v1/incidents/:id/evidence` — Ingest evidence and compute SHA-256
- `POST /v1/incidents/:id/validate` — Deterministic validation
- `GET  /v1/incidents/:id/events` — Incident audit trail

### CAP Service (`:3002`)
- `GET  /cap/capabilities` — List supported action registry
- `POST /cap/cases` — Create new case from incident
- `POST /cap/actions/validate` — Validate action payload
- `POST /cap/actions/execute` — Execute typed CAP action
- `GET  /cap/cases/:id` — Query case details
- `GET  /cap/cases/:id/events` — Chronological event stream
- `POST /cap/events` — Broadcast event

### Portal A (`:3003`)
- `POST /portal-a/intake` — Ingest fraud report via CAP
- `GET  /portal-a/cases` — List intake cases

---

## 4. Testing Contract Execution

Run end-to-end CAP validation:
```bash
pnpm test:e2e:cap
```
