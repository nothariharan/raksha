/**
 * Raksha Deterministic Demo Reset Script (pnpm demo:reset)
 * Resets local database, seeds canonical demo persona (Ramesh Kumar), and clears event ledgers.
 */

import { existsSync, unlinkSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  defaultDbClient,
  defaultIncidentRepository,
  defaultIdentityAllocator,
} from "@raksha/core";
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
  globalEventBus.setIdFactory(() => defaultIdentityAllocator.allocateEventId("EVT"));

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
    // Normalize mobile before seeding so DB lookup via normalizeMobile() will match
    const normalizedMobile = seedIncident.reporter?.mobile
      ? seedIncident.reporter.mobile.replace(/\D/g, "").replace(/^0+/, "")
      : "919876543210";
    const seedRow = {
      ...seedIncident,
      reporter: {
        ...seedIncident.reporter,
        mobile: normalizedMobile,
      },
    };
    await defaultIncidentRepository.create(seedRow);
    // Bind session caches so any pre-existing channel session picks up RKS-000001 immediately
    defaultConversationStore.bindIncident(normalizedMobile, seedRow.id, seedRow.state);
    defaultConversationStore.bindIncident(`+${normalizedMobile}`, seedRow.id, seedRow.state);
    console.log(`  ✓ Seeded canonical incident: ${seedRow.id} (Citizen: ${persona.name}, mobile: ${normalizedMobile})`);
  }

  // Sequences must sit past seeded numeric suffixes so next allocate is RKS-000002.
  await defaultIdentityAllocator.syncSequences();

  console.log("  ✓ Event ledger and identity sequences synced past seed");
  console.log("\n==========================================================");
  console.log("  DEMO RESET COMPLETE");
  console.log("");
  console.log("  Citizen : Ramesh Kumar");
  console.log("  Mobile  : 919876543210");
  console.log("  Incident: RKS-000001");
  console.log("  State   : INTAKE");
  console.log("==========================================================\n");
}

if (process.argv[1]?.includes("demo-reset")) {
  runDemoReset().catch((err) => {
    console.error("Failed to reset demo:", err);
    process.exit(1);
  });
}
