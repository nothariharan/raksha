/**
 * Synthetic & Standard ID Generators for Raksha & CAP
 *
 * Sync counters remain for unit tests and InMemory CAP mocks.
 * Production / gateway paths must use IdentityAllocator (Postgres or file sequences).
 */

export type IdentityKind = "incident" | "case" | "evidence" | "event";
export type IdentityPrefix = string;

let incidentCounter = 1;
let caseCounter = 1;
let evidenceCounter = 1;
let eventCounter = 1;

export function formatIdentityId(kind: IdentityKind, n: number, prefix?: IdentityPrefix): string {
  switch (kind) {
    case "incident":
      return `${prefix ?? "RKS"}-${String(n).padStart(6, "0")}`;
    case "case":
      return `${prefix ?? "CAP"}-${String(n).padStart(6, "0")}`;
    case "evidence":
      return `${prefix ?? "EV"}-${String(n).padStart(3, "0")}`;
    case "event":
      return `${prefix ?? "EVT"}-${String(n).padStart(6, "0")}`;
  }
}

/** Extract trailing numeric suffix from RKS-000042 / CAP-000003 / EV-012 / EVT-000001. */
export function parseIdentitySuffix(id: string): number {
  const m = String(id).match(/(\d+)$/);
  return m ? Number(m[1]) : 0;
}

export function generateIncidentId(prefix = "RKS"): string {
  return formatIdentityId("incident", incidentCounter++, prefix);
}

export function generateCaseId(prefix = "CAP"): string {
  return formatIdentityId("case", caseCounter++, prefix);
}

export function generateEvidenceId(prefix = "EV"): string {
  return formatIdentityId("evidence", evidenceCounter++, prefix);
}

export function generateEventId(prefix = "EVT"): string {
  return formatIdentityId("event", eventCounter++, prefix);
}

export function generateExternalReference(portal = "1930"): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `${portal}-SYN-${randomSuffix}`;
}

export function resetCounters(): void {
  incidentCounter = 1;
  caseCounter = 1;
  evidenceCounter = 1;
  eventCounter = 1;
}

/** Align in-memory counters past already-used suffixes (isolated unit tests only). */
export function seedCountersFromMax(maxByKind: Partial<Record<IdentityKind, number>>): void {
  if (maxByKind.incident != null) incidentCounter = maxByKind.incident + 1;
  if (maxByKind.case != null) caseCounter = maxByKind.case + 1;
  if (maxByKind.evidence != null) evidenceCounter = maxByKind.evidence + 1;
  if (maxByKind.event != null) eventCounter = maxByKind.event + 1;
}
