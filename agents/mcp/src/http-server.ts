/**
 * MCP JSON-RPC 2.0 HTTP Server
 * Exposes standard Model Context Protocol endpoints over HTTP.
 */

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { RakshaMCPServer, defaultMCPServer } from "./mcp-server.js";

function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        if (!data || data.trim() === "") {
          resolve({} as T);
        } else {
          resolve(JSON.parse(data) as T);
        }
      } catch (err) {
        reject(new Error(`Invalid JSON body: ${(err as Error).message}`));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data, null, 2));
}

export async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  mcp?: RakshaMCPServer
): Promise<void> {
  const serverInstance = mcp || defaultMCPServer;
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  try {
    if (pathname === "/health" && method === "GET") {
      sendJson(res, 200, {
        status: "ok",
        service: "raksha-agent-mcp",
        protocol: "mcp/0.1",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if ((pathname === "/mcp" || pathname === "/mcp/rpc") && method === "POST") {
      const body = await parseJsonBody<{
        jsonrpc?: string;
        id?: string | number;
        method: string;
        params?: any;
      }>(req);

      const id = body.id || 1;

      if (body.method === "tools/list") {
        const tools = serverInstance.listTools();
        sendJson(res, 200, {
          jsonrpc: "2.0",
          id,
          result: { tools },
        });
        return;
      }

      if (body.method === "tools/call") {
        const { name, arguments: args } = body.params || {};
        const result = await serverInstance.callTool(name, args || {});
        sendJson(res, 200, {
          jsonrpc: "2.0",
          id,
          result,
        });
        return;
      }

      if (body.method === "initialize" || body.method === "ping") {
        sendJson(res, 200, {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            serverInfo: { name: "raksha-mcp-server", version: "0.1.0" },
            capabilities: { tools: {} },
          },
        });
        return;
      }

      sendJson(res, 400, {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${body.method}` },
      });
      return;
    }

    sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err) {
    console.error("[MCP Server Error]:", err);
    sendJson(res, 500, { error: (err as Error).message || "Internal Server Error" });
  }
}

export function createMCPServer(mcp?: RakshaMCPServer) {
  return createServer((req, res) => handleMcpRequest(req, res, mcp));
}
