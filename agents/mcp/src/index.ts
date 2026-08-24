/**
 * Raksha Model Context Protocol (MCP) Server
 * Exposes typed civic action tools for autonomous AI agents.
 */

import { DEFAULT_CAPABILITIES } from "@raksha/cap-sdk";

export const MCP_SERVER_INFO = {
  name: "raksha-civic-action-protocol",
  version: "0.1.0",
  description: "Autonomous Emergency Incident & Civic Action Protocol MCP Server",
  tools: DEFAULT_CAPABILITIES.map((cap) => ({
    name: cap.name,
    description: cap.description,
    inputSchema: {
      type: "object",
      required: cap.requiredFields,
    },
  })),
};

console.log(`[MCP Server] Initialized with tools:`, MCP_SERVER_INFO.tools.map((t) => t.name));
