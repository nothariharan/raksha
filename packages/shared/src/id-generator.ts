/**
 * Synthetic & Standard ID Generators for Raksha & CAP
 */

let incidentCounter = 1;
let caseCounter = 1;
let evidenceCounter = 1;
let eventCounter = 1;

export function generateIncidentId(prefix = "RKS"): string {
  const padded = String(incidentCounter++).padStart(6, "0");
  return `${prefix}-${padded}`;
}

export function generateCaseId(prefix = "CAP"): string {
  const padded = String(caseCounter++).padStart(6, "0");
  return `${prefix}-${padded}`;
}

export function generateEvidenceId(prefix = "EV"): string {
  const padded = String(evidenceCounter++).padStart(3, "0");
  return `${prefix}-${padded}`;
}

export function generateEventId(prefix = "EVT"): string {
  const padded = String(eventCounter++).padStart(6, "0");
  return `${prefix}-${padded}`;
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
