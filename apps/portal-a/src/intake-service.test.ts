import { describe, it, beforeEach, expect } from "vitest";
import { createCAPClient } from "@raksha/cap-sdk";
import { resetCounters, globalEventBus } from "@raksha/shared";
import { PortalAIntakeService } from "./intake-service.js";
import { SYNTHETIC_INTAKE_INCIDENT } from "./synthetic-data.js";
import { canTransition, nextLifecycle } from "./state-machine.js";
import { createPortalAServer } from "./server.js";
import { portalAIntakeService } from "./intake-service.js";

describe("Portal A intake (CAP-only)", () => {
  let portalA: PortalAIntakeService;

  beforeEach(() => {
    resetCounters();
    globalEventBus.clear();
    const cap = createCAPClient({ mode: "in-memory" });
    portalA = new PortalAIntakeService(cap);
  });

  it("submits through CAP and stores a local ACCEPTED case", async () => {
    const result = await portalA.reportFraudIncident(SYNTHETIC_INTAKE_INCIDENT);
    expect(result.success).toBe(true);
    expect(result.portalCase?.lifecycle).toBe("ACCEPTED");
    expect(result.portalCase?.incident.transaction.transactionId).toBe("423456789012");
    expect(result.portalCase?.incident.transaction.debitInstitution).toBe("HDFC Bank");
    expect(result.capResponse.status).toBe("ACCEPTED");
  });

  it("advances lifecycle on acknowledge without talking to Portal B", async () => {
    const created = await portalA.reportFraudIncident(SYNTHETIC_INTAKE_INCIDENT);
    const id = created.portalCase!.portalCaseId;
    const updated = await portalA.acknowledgeCase(id);
    expect(updated?.lifecycle).toBe("UNDER_REVIEW");
    const again = await portalA.acknowledgeCase(id);
    expect(again?.lifecycle).toBe("FORWARDED");
  });

  it("defines the demo state machine", () => {
    expect(nextLifecycle("RECEIVED")).toBe("VALIDATING");
    expect(canTransition("ACCEPTED", "UNDER_REVIEW")).toBe(true);
    expect(canTransition("FORWARDED", "ACCEPTED")).toBe(false);
  });
});

describe("Portal A HTTP routes", () => {
  it("serves UI and creates a case via POST /portal-a/cases", async () => {
    resetCounters();
    globalEventBus.clear();
    portalAIntakeService.clear();
    const server = createPortalAServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;

    const ui = await fetch(`http://127.0.0.1:${port}/report`);
    expect(ui.headers.get("content-type")).toContain("text/html");

    const created = await fetch(`http://127.0.0.1:${port}/portal-a/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": "test-intake-1" },
      body: JSON.stringify({
        narrativeText: "UPI fraud of 5000",
        amount: 5000,
        transactionId: "423456789012",
        debitInstitution: "State Bank of India",
        beneficiaryIdentifier: "fraudster@upi",
      }),
    });
    expect(created.status).toBe(201);
    const body = (await created.json()) as { portalCase: { portalCaseId: string } };
    const got = await fetch(`http://127.0.0.1:${port}/portal-a/cases/${body.portalCase.portalCaseId}`);
    expect(got.status).toBe(200);

    server.close();
  });
});
