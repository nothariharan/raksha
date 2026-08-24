/**
 * Portal A — Cyber Fraud Intake Service
 * Communicates strictly through CAP (supports HTTP and in-memory CAP clients).
 */

import { FraudIncident, CAPActionResponse } from "@raksha/schemas";
import { createCAPClient, ICAPClient } from "@raksha/cap-sdk";

export interface PortalACase {
  portalCaseId: string;
  capCaseId: string;
  externalReference: string;
  status: "ACCEPTED" | "REJECTED" | "INVESTIGATING" | "CLOSED";
  incidentId: string;
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
  }

  async reportFraudIncident(
    incident: FraudIncident,
    idempotencyKey?: string
  ): Promise<{
    success: boolean;
    portalCase: PortalACase | null;
    capResponse: CAPActionResponse;
  }> {
    // 1. Submit through CAP with optional Idempotency Key
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

    // Check if we already have this case locally
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

    // 2. Create Portal A internal case
    const portalCaseId = `PA-${String(portalCaseCounter++).padStart(6, "0")}`;
    const portalCase: PortalACase = {
      portalCaseId,
      capCaseId: capResponse.caseId,
      externalReference: capResponse.externalReference || `1930-SYN-${capResponse.caseId}`,
      status: "ACCEPTED",
      incidentId: incident.id,
      receivedAt: new Date().toISOString(),
      summary: `Cyber Fraud Report: ₹${incident.transaction.amount || 0} via ${incident.transaction.channel || "UPI"}`,
    };

    this.localCases.set(portalCaseId, portalCase);

    return {
      success: true,
      portalCase,
      capResponse,
    };
  }

  getPortalCase(portalCaseId: string): PortalACase | null {
    return this.localCases.get(portalCaseId) || null;
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
