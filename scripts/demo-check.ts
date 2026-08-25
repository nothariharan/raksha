/**
 * Raksha Demo Health Checker (pnpm demo:check)
 * Performs pre-flight verification across all 8 protocol services.
 */

interface HealthCheckResult {
  name: string;
  url: string;
  ok: boolean;
  statusText?: string;
}

export async function runDemoCheck(): Promise<boolean> {
  console.log("\n==========================================================");
  console.log("  CHECKING RAKSHA PROTOCOL SYSTEM HEALTH");
  console.log("==========================================================\n");

  const services = [
    { name: "Core API", url: "http://localhost:3001/health" },
    { name: "System Orchestrator", url: "http://localhost:3001/system/health" },
    { name: "Civic Action Protocol (CAP)", url: "http://localhost:3002/health" },
    { name: "Portal A (1930 Intake)", url: "http://localhost:3003/health" },
    { name: "Portal B (Bank Response)", url: "http://localhost:3004/health" },
    { name: "Web UI & Dev Console", url: "http://localhost:3000/health" },
    { name: "WhatsApp Webhook Adapter", url: "http://localhost:3005/health" },
    { name: "Voice Telephony Simulator", url: "http://localhost:3006/health" },
    { name: "Model Context Protocol (MCP)", url: "http://localhost:3007/health" },
  ];

  const results: HealthCheckResult[] = [];
  let allHealthy = true;

  for (const svc of services) {
    try {
      const res = await fetch(svc.url, { signal: AbortSignal.timeout(2000) });
      const isOk = res.ok;
      results.push({ name: svc.name, url: svc.url, ok: isOk, statusText: `${res.status} OK` });
      if (!isOk) allHealthy = false;
    } catch (err) {
      results.push({ name: svc.name, url: svc.url, ok: false, statusText: "UNREACHABLE" });
      allHealthy = false;
    }
  }

  console.log("RAKSHA PROTOCOL SERVICE STATUS:\n");
  for (const r of results) {
    const symbol = r.ok ? "✓" : "✗";
    const statusColor = r.ok ? "\x1b[32m" : "\x1b[31m";
    const resetColor = "\x1b[0m";
    console.log(`  ${symbol} ${r.name.padEnd(30)} ${statusColor}${r.statusText || (r.ok ? "READY" : "DOWN")}${resetColor}`);
  }

  console.log("\n==========================================================");
  if (allHealthy) {
    console.log("  \x1b[32mALL SERVICES GREEN — READY FOR LIVE DEMONSTRATION\x1b[0m");
  } else {
    console.log("  \x1b[33mSOME SERVICES UNREACHABLE — Run `pnpm demo` to start all services\x1b[0m");
  }
  console.log("==========================================================\n");

  return allHealthy;
}

if (process.argv[1]?.includes("demo-check")) {
  runDemoCheck().then((ok) => {
    if (!ok) process.exit(1);
    process.exit(0);
  });
}
