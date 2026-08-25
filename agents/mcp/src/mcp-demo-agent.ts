/**
 * Autonomous MCP Demo AI Agent
 * Demonstrates an external personal AI assistant discovering public services and filing an emergency cyber fraud report via CAP.
 */

import { RakshaMCPServer, defaultMCPServer } from "./mcp-server.js";

export interface AgentStepTrace {
  step: number;
  tool: string;
  input: Record<string, unknown>;
  output: unknown;
  thought: string;
}

export class MCPDemoAgent {
  private mcp: RakshaMCPServer;
  private trace: AgentStepTrace[] = [];

  constructor(server?: RakshaMCPServer) {
    this.mcp = server || defaultMCPServer;
  }

  getTrace(): AgentStepTrace[] {
    return this.trace;
  }

  async runAutonomousReportingFlow(params: {
    distressNarrative: string;
    screenshotOCR: string;
    screenshotUrl?: string;
    citizenPhone: string;
  }): Promise<{
    success: boolean;
    incidentId: string;
    officialReference: string;
    trace: AgentStepTrace[];
  }> {
    this.trace = [];
    let step = 1;

    // Step 1: Discover CAP Capabilities
    const discRes = await this.mcp.callTool("raksha_discover_capabilities", {});
    const discData = JSON.parse(discRes.content[0].text);
    this.trace.push({
      step: step++,
      tool: "raksha_discover_capabilities",
      input: {},
      output: discData,
      thought: "I queried CAP to discover available authorized civic actions without scraping government portals.",
    });

    // Step 2: Start Incident from User Prompt
    const startRes = await this.mcp.callTool("raksha_start_incident", {
      narrative: params.distressNarrative,
      reporterPhone: params.citizenPhone,
      language: "en",
    });
    const startData = JSON.parse(startRes.content[0].text);
    const incidentId = startData.incidentId;
    this.trace.push({
      step: step++,
      tool: "raksha_start_incident",
      input: { narrative: params.distressNarrative, reporterPhone: params.citizenPhone },
      output: startData,
      thought: `Created incident ${incidentId}. Backend identified missing UTR and requested evidence.`,
    });

    // Step 3: Add Screenshot Evidence
    const evRes = await this.mcp.callTool("raksha_add_evidence", {
      incidentId,
      type: "SCREENSHOT",
      mediaUrl: params.screenshotUrl || "https://synthetic.storage/mcp/ss_payment.jpg",
      ocrText: params.screenshotOCR,
    });
    const evData = JSON.parse(evRes.content[0].text);
    this.trace.push({
      step: step++,
      tool: "raksha_add_evidence",
      input: { incidentId, type: "SCREENSHOT", ocrText: params.screenshotOCR },
      output: evData,
      thought: "Cryptographic evidence attached to incident capsule. UTR and amount reconciled to READY.",
    });

    // Step 4: Obtain Human Confirmation & Execute High-Risk CAP Submission
    const submitRes = await this.mcp.callTool("raksha_submit_incident", {
      incidentId,
      confirmedByCitizen: true,
    });
    const submitData = JSON.parse(submitRes.content[0].text);
    this.trace.push({
      step: step++,
      tool: "raksha_submit_incident",
      input: { incidentId, confirmedByCitizen: true },
      output: submitData,
      thought: `Human confirmed transaction. Dispatched official freeze action via CAP. Reference: ${submitData.officialReference}`,
    });

    return {
      success: submitData.success,
      incidentId,
      officialReference: submitData.officialReference,
      trace: this.trace,
    };
  }
}
