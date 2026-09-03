/**
 * pnpm raksha — product start (no wipe). Matches Render: one unified gateway process.
 */

import { startProductionGateway } from "./prod-server.js";

const PORT = Number(process.env.PORT) || 3000;

async function waitForHealth(baseUrl: string, attempts = 40): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function main(): Promise<void> {
  console.log("\n==========================================================");
  console.log("  RAKSHA — AUTONOMOUS PRODUCT BOOT (no demo wipe)");
  console.log("==========================================================\n");

  if (!process.env.PORT) {
    console.log(`  · PORT not set; using default ${PORT}`);
  }

  await startProductionGateway();

  const baseUrl = `http://127.0.0.1:${PORT}`;
  const ok = await waitForHealth(baseUrl);
  if (!ok) {
    console.error(`\nFAIL  health check did not pass at ${baseUrl}/health\n`);
    process.exit(1);
  }

  console.log("----------------------------------------------------------");
  console.log(`  PASS  gateway healthy`);
  console.log(`  URL   ${baseUrl}`);
  console.log(`  App   ${baseUrl}/app`);
  console.log("  Tip   run `pnpm preflight` in another terminal");
  console.log("----------------------------------------------------------\n");
}

main().catch((err) => {
  console.error("FAIL  raksha boot:", err);
  process.exit(1);
});
