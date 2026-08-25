import { createMCPServer } from "./http-server.js";

export * from "./policy.js";
export * from "./mcp-server.js";
export * from "./mcp-demo-agent.js";
export * from "./http-server.js";

const PORT = Number(process.env.PORT_MCP) || 3007;

if (process.env.NODE_ENV !== "test") {
  const server = createMCPServer();
  server.listen(PORT, () => {
    console.log(`[Raksha MCP Server] Listening on http://localhost:${PORT}`);
  });
}
