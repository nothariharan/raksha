/**
 * Portal A — Cyber Fraud Intake Service
 * Communicates strictly through CAP (supports HTTP and in-memory CAP clients).
 */

import { FraudIncident, CAPActionResponse } from "@raksha/schemas";
import { createCAPClient, ICAPClient } from "@raksha/cap-sdk";
import {
  PortalALifecycle,
  nextLifecycle,
  transitionLifecycle,
} from "./state-machine.js";

export interface PortalACase {
  portalCaseId: string;
  capCaseId: string;
  externalReference: string;
  /** CAP case status mirrored from the last CAP response. */
  status: "ACCEPTED" | "REJECTED" | "INVESTIGATING" | "CLOSED";
  lifecycle: PortalALifecycle;
  incidentId: string;
  incident: FraudIncident;
  receivedAt: string;
  summary: string;
}

let portalCaseCounter = 1;

export class PortalAIntakeService {
  private capClient: ICAPClient;
  private localCases: Map<string, PortalACase> = new Map();

  constructor(capClient?: ICAPClient) {
    this.capClient =
      capClient ||
      createCAPClient({
        mode: process.env.CAP_MODE === "http" ? "http" : "in-memory",
        baseUrl: process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002",
      });

    // Pre-seed Canonical Demo Incident (Ramesh Kumar, ₹5,000)
    this.localCases.set("1930-SYN-295411", {
      portalCaseId: "1930-SYN-295411",
      capCaseId: "CAP-DEMO-001",
      externalReference: "1930-SYN-295411",
      status: "ACCEPTED",
      lifecycle: "ACCEPTED",
      incidentId: "RKS-DEMO-001",
      incident: {
        id: "RKS-DEMO-001",
        protocolVersion: "raksha/0.1",
        type: "FINANCIAL_CYBER_FRAUD",
        narrative: {
          text: "Paid ₹5,000 via PhonePe after a fraudulent electricity bill disconnection call.",
          source: "phone",
        },
        reporter: {
          name: "Ramesh Kumar",
          mobile: "+919876543210",
        },
        transaction: {
          amount: 5000,
          currency: "INR",
          transactionId: "423456789012",
          timestamp: new Date().toISOString(),
          debitInstitution: "State Bank of India",
          beneficiaryIdentifier: "electricity-fraud@upi",
          channel: "UPI",
        },
        evidence: ["EV-001-SCREENSHOT"],
        state: "SUBMITTED",
        validation: {
          status: "READY",
          missingFields: [],
          conflicts: [],
        },
        handoff: {
          target: "1930",
          status: "ACCEPTED",
          externalReference: "1930-SYN-295411",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      receivedAt: new Date().toISOString(),
      summary: "₹5,000 fake electricity bill scam via PhonePe with UTR 423456789012.",
    });
  }

  async reportFraudIncident(
    incident: FraudIncident,
    idempotencyKey?: string
  ): Promise<{
    success: boolean;
    portalCase: PortalACase | null;
    capResponse: CAPActionResponse;
  }> {
    const capResponse = await this.capClient.executeAction(
      "report_financial_fraud",
      { incident },
      idempotencyKey
    );

    if (!capResponse.success) {
      return {
        success: false,
        portalCase: null,
        capResponse,
      };
    }

    const existing = Array.from(this.localCases.values()).find(
      (c) => c.capCaseId === capResponse.caseId
    );
    if (existing) {
      return {
        success: true,
        portalCase: existing,
        capResponse,
      };
    }

    const capCase = await this.capClient.getCase(capResponse.caseId);
    const storedIncident =
      capCase && capCase.payload && typeof capCase.payload === "object" && "id" in (capCase.payload as object)
        ? (capCase.payload as FraudIncident)
        : incident;

    const portalCaseId = `PA-${String(portalCaseCounter++).padStart(6, "0")}`;
    const portalCase: PortalACase = {
      portalCaseId,
      capCaseId: capResponse.caseId,
      externalReference: capResponse.externalReference || `1930-SYN-${capResponse.caseId}`,
      status: "ACCEPTED",
      lifecycle: "ACCEPTED",
      incidentId: storedIncident.id,
      incident: storedIncident,
      receivedAt: new Date().toISOString(),
      summary: `Cyber Fraud Report: ₹${storedIncident.transaction.amount || 0} via ${storedIncident.transaction.channel || "UPI"}`,
    };

    this.localCases.set(portalCaseId, portalCase);

    return {
      success: true,
      portalCase,
      capResponse,
    };
  }

  async acknowledgeCase(portalCaseId: string): Promise<PortalACase | null> {
    const portalCase = this.localCases.get(portalCaseId);
    if (!portalCase) return null;

    const target = nextLifecycle(portalCase.lifecycle);
    if (!target) {
      return portalCase;
    }

    portalCase.lifecycle = transitionLifecycle(portalCase.lifecycle, target);
    const capCase = await this.capClient.getCase(portalCase.capCaseId);
    if (capCase?.status) {
      if (capCase.status === "ACCEPTED") portalCase.status = "ACCEPTED";
    }

    await this.capClient.emitEvent({
      type: "case.updated",
      caseId: portalCase.capCaseId,
      incidentId: portalCase.incidentId,
      source: "portal-a",
      payload: {
        portalCaseId: portalCase.portalCaseId,
        lifecycle: portalCase.lifecycle,
      },
    });

    this.localCases.set(portalCaseId, portalCase);
    return portalCase;
  }

  getPortalCase(portalCaseId: string): PortalACase | null {
    return this.localCases.get(portalCaseId) || null;
  }

  getPortalCaseByCapId(capCaseId: string): PortalACase | null {
    return Array.from(this.localCases.values()).find((c) => c.capCaseId === capCaseId) || null;
  }

  listPortalCases(): PortalACase[] {
    return Array.from(this.localCases.values());
  }

  clear(): void {
    this.localCases.clear();
    portalCaseCounter = 1;
  }
}

export const portalAIntakeService = new PortalAIntakeService();
