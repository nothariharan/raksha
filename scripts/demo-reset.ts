/**
 * Raksha Deterministic Demo Reset Script (pnpm demo:reset)
 * Resets local database, seeds canonical demo persona (Ramesh Kumar), and clears event ledgers.
 */

import { existsSync, unlinkSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defaultDbClient, defaultIncidentRepository } from "@raksha/core";
import { defaultConversationStore } from "@raksha/agent-whatsapp";
import { defaultPhoneSessionManager } from "@raksha/agent-phone";
import { resetCounters, globalEventBus } from "@raksha/shared";

export async function runDemoReset(): Promise<void> {
  console.log("\n==========================================================");
  console.log("  RESETTING RAKSHA DEMO ENVIRONMENT TO CLEAN STATE");
  console.log("==========================================================\n");

  const dbPath = join(process.cwd(), ".data", "raksha-db.json");
  if (existsSync(dbPath)) {
    unlinkSync(dbPath);
    console.log("  ✓ Cleared previous database state (.data/raksha-db.json)");
  }

  defaultDbClient.clearStorage();
  resetCounters();
  globalEventBus.clear();

  // Read Canonical Persona & Seed Incident
  const personaPath = join(process.cwd(), "demo-data", "persona.json");
  const incidentPath = join(process.cwd(), "demo-data", "incident.json");

  let persona = { name: "Ramesh Kumar", mobile: "+919876543210" };
  let seedIncident: any = null;

  if (existsSync(personaPath)) {
    persona = JSON.parse(readFileSync(personaPath, "utf-8"));
  }
  if (existsSync(incidentPath)) {
    seedIncident = JSON.parse(readFileSync(incidentPath, "utf-8"));
  }

  defaultConversationStore.clear();
  defaultPhoneSessionManager.clear();

  if (seedIncident) {
    await defaultIncidentRepository.create(seedIncident);
    if (seedIncident.id !== "RKS-000001") {
      await defaultIncidentRepository.create({
        ...seedIncident,
        id: "RKS-000001",
      });
    }
    defaultConversationStore.bindIncident(persona.mobile, seedIncident.id, seedIncident.state);
    console.log(`  ✓ Seeded canonical incident: ${seedIncident.id} (Citizen: ${persona.name}, ₹${seedIncident.transaction.amount})`);
  }

  console.log("  ✓ Event ledger and CAP case counters reset to zero");
  console.log("\n==========================================================");
  console.log("  DEMO RESET COMPLETE: READY FOR LIVE PRESENTATION");
  console.log("==========================================================\n");
}

if (process.argv[1]?.includes("demo-reset")) {
  runDemoReset().catch((err) => {
    console.error("Failed to reset demo:", err);
    process.exit(1);
  });
}
