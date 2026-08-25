# Civic Action Protocol (CAP) Contract & Specification

## Protocol Version: `cap/0.1`

### Overview
The Civic Action Protocol (CAP) provides an open standard for machine-readable civic actions. It acts as an abstraction layer between citizens/AI agents and government intake portals (1930 / Portal A) and financial intermediaries (Banks / Portal B).

---

### Machine-Readable Capability Discovery (`GET /cap/capabilities`)

Agents query this endpoint to dynamically discover authorized actions:

```json
{
  "protocol": "cap/0.1",
  "manifest": {
    "protocol": "cap/0.1",
    "version": "0.1.0",
    "name": "Civic Action Protocol (CAP)",
    "services": [
      {
        "id": "cybercrime.intake",
        "name": "Citizen Financial Cyber Fraud Reporting (1930 / Portal A)",
        "targetPortal": "portal-a",
        "status": "OPERATIONAL",
        "actions": [
          {
            "name": "report_financial_fraud",
            "description": "File emergency financial fraud freeze and evidence packet",
            "requires": [
              "transaction.amount",
              "transaction.transactionId",
              "transaction.timestamp",
              "transaction.debitInstitution",
              "narrative.text"
            ],
            "risk": "HIGH",
            "requiresConfirmation": true,
            "idempotent": true
          }
        ]
      }
    ]
  }
}
```

---

### Action Execution (`POST /cap/actions/execute`)

**Headers:**
- `Content-Type: application/json`
- `Idempotency-Key: <unique-key>`

**Request Body:**
```json
{
  "action": "report_financial_fraud",
  "payload": { ...canonicalIncident },
  "idempotencyKey": "web-cap-RKS-000001"
}
```

**Response Body:**
```json
{
  "success": true,
  "caseId": "CAP-000001",
  "externalReference": "1930-SYN-958303",
  "targetPortal": "portal-a",
  "status": "SUBMITTED",
  "timestamp": "2026-08-25T18:43:00.000Z"
}
```
