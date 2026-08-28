/**
 * Automated Verification for Unified Production Gateway
 * Tests all routes on a single port to ensure seamless Render deployment.
 */

import { createUnifiedGatewayServer } from "../scripts/prod-server.js";
import assert from "node:assert";

async function runProdGatewayTest() {
  console.log("\n==========================================================");
  console.log("  RUNNING UNIFIED PRODUCTION GATEWAY TEST SUITE");
  console.log("==========================================================\n");

  const TEST_PORT = 3199;
  const server = createUnifiedGatewayServer();
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  const baseUrl = `http://localhost:${TEST_PORT}`;

  try {
    // 1. Health & Ready Probes
    console.log("▶ [1/10] Verifying GET /health and GET /ready...");
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const healthData = (await healthRes.json()) as any;
    assert.equal(healthData.status, "healthy");
    assert.equal(healthData.version, "0.7.0");
    console.log("  ✓ /health returned 200 (healthy)");

    const readyRes = await fetch(`${baseUrl}/ready`);
    assert.equal(readyRes.status, 200);
    console.log("  ✓ /ready returned 200 (ready)");

    // 2. Landing & Editorial Pages
    console.log("\n▶ [2/10] Verifying Editorial Pages (/ , /how , /agents)...");
    const homeRes = await fetch(`${baseUrl}/`);
    assert.equal(homeRes.status, 200);
    const homeHtml = await homeRes.text();
    assert.ok(homeHtml.includes("Raksha"));
    console.log("  ✓ / (Home) returned 200");

    const howRes = await fetch(`${baseUrl}/how`);
    assert.equal(howRes.status, 200);
    console.log("  ✓ /how returned 200");

    const agentsRes = await fetch(`${baseUrl}/agents`);
    assert.equal(agentsRes.status, 200);
    console.log("  ✓ /agents returned 200");

    // 3. Route Separation: Human /cap vs API /api/cap/*
    console.log("\n▶ [3/10] Verifying Route Separation: /cap (UI) vs /api/cap/* (API)...");
    const capUiRes = await fetch(`${baseUrl}/cap`);
    assert.equal(capUiRes.status, 200);
    const capUiHtml = await capUiRes.text();
    assert.ok(capUiHtml.includes("Civic Action Protocol") || capUiHtml.includes("CAP"));
    console.log("  ✓ /cap returned HTML UI page (no API collision)");

    const capApiRes = await fetch(`${baseUrl}/api/cap/capabilities`);
    assert.equal(capApiRes.status, 200);
    const capApiData = (await capApiRes.json()) as any;
    assert.equal(capApiData.protocol, "cap/0.1");
    console.log("  ✓ /api/cap/capabilities returned JSON API specification");

    // 4. Citizen Intake Console
    console.log("\n▶ [4/10] Verifying Citizen Intake (/app)...");
    const appRes = await fetch(`${baseUrl}/app`);
    assert.equal(appRes.status, 200);
    const appHtml = await appRes.text();
    assert.ok(appHtml.includes("Raksha"));
    console.log("  ✓ /app returned 200");

    // 5. Portals A & B UI
    console.log("\n▶ [5/10] Verifying Portals A and B UI routes...");
    const portalARes = await fetch(`${baseUrl}/portal-a`);
    assert.equal(portalARes.status, 200);
    console.log("  ✓ /portal-a returned 200");

    const portalBRes = await fetch(`${baseUrl}/portal-b`);
    assert.equal(portalBRes.status, 200);
    console.log("  ✓ /portal-b returned 200");

    // 6. Core Orchestration API (/v1/process)
    console.log("\n▶ [6/10] Verifying Core Intake API (POST /v1/process)...");
    const procRes = await fetch(`${baseUrl}/v1/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "web",
        modality: "text",
        content: "I paid 5000 rupees via PhonePe from State Bank of India with UTR 423456789012 after an electricity scam call.",
        language: "en",
      }),
    });
    assert.equal(procRes.status, 200);
    const procData = (await procRes.json()) as any;
    assert.ok(procData.incidentId);
    assert.equal(procData.incident.transaction.amount, 5000);
    assert.equal(procData.incident.transaction.debitInstitution, "State Bank of India");
    assert.equal(procData.incident.transaction.transactionId, "423456789012");
    console.log(`  ✓ POST /v1/process extracted incident: ${procData.incidentId}`);

    // 7. CAP Execution API (/api/cap/actions/execute)
    console.log("\n▶ [7/10] Verifying CAP Execution (POST /api/cap/actions/execute)...");
    const capExecRes = await fetch(`${baseUrl}/api/cap/actions/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `test-idem-${procData.incidentId}`,
      },
      body: JSON.stringify({
        action: "report_financial_fraud",
        payload: procData.incident,
        idempotencyKey: `test-idem-${procData.incidentId}`,
      }),
    });
    assert.equal(capExecRes.status, 200);
    const capExecData = (await capExecRes.json()) as any;
    assert.equal(capExecData.success, true);
    assert.ok(capExecData.externalReference.startsWith("1930-SYN-"));
    console.log(`  ✓ POST /api/cap/actions/execute returned reference: ${capExecData.externalReference}`);

    // 8. Portal B API (/portal-b/alerts)
    console.log("\n▶ [8/10] Verifying Portal B Alerts API (GET /portal-b/alerts)...");
    const alertsRes = await fetch(`${baseUrl}/portal-b/alerts`);
    assert.equal(alertsRes.status, 200);
    const alertsData = (await alertsRes.json()) as any;
    assert.ok(Array.isArray(alertsData.alerts));
    console.log(`  ✓ GET /portal-b/alerts returned ${alertsData.alerts.length} active alert(s)`);

    // 9. WhatsApp Webhook Adapter
    console.log("\n▶ [9/10] Verifying WhatsApp Webhook (POST /whatsapp/webhook)...");
    const waRes = await fetch(`${baseUrl}/whatsapp/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: "whatsapp:+919876543210",
        Body: "STATUS",
      }),
    });
    assert.equal(waRes.status, 200);
    const waData = (await waRes.json()) as any;
    assert.equal(waData.success, true);
    console.log("  ✓ POST /whatsapp/webhook processed STATUS request");

    // 10. MCP Server Endpoint (/mcp)
    console.log("\n▶ [10/10] Verifying Model Context Protocol (POST /mcp)...");
    const mcpRes = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      }),
    });
    assert.equal(mcpRes.status, 200);
    const mcpData = (await mcpRes.json()) as any;
    assert.ok(Array.isArray(mcpData.result?.tools));
    console.log(`  ✓ POST /mcp tools/list returned ${mcpData.result.tools.length} public tool(s)`);

    console.log("\n==========================================================");
    console.log("  ALL 10 UNIFIED PRODUCTION GATEWAY TESTS PASSED (100%)");
    console.log("==========================================================\n");
  } finally {
    server.close();
  }
}

runProdGatewayTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
