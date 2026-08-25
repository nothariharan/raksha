/**
 * Portal B — Operational financial response lifecycle state machine.
 */

export const PORTAL_B_STATES = [
  "NEW",
  "REVIEWING",
  "VERIFIED",
  "RESPONSE_INITIATED",
  "ACKNOWLEDGED",
] as const;

export type PortalBLifecycle = (typeof PORTAL_B_STATES)[number];

const TRANSITIONS: Record<PortalBLifecycle, PortalBLifecycle[]> = {
  NEW: ["REVIEWING"],
  REVIEWING: ["VERIFIED"],
  VERIFIED: ["RESPONSE_INITIATED"],
  RESPONSE_INITIATED: ["ACKNOWLEDGED"],
  ACKNOWLEDGED: [],
};

export function canTransition(from: PortalBLifecycle, to: PortalBLifecycle): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextLifecycle(from: PortalBLifecycle): PortalBLifecycle | null {
  return TRANSITIONS[from][0] ?? null;
}

export function transitionLifecycle(
  from: PortalBLifecycle,
  to: PortalBLifecycle
): PortalBLifecycle {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid Portal B transition: ${from} → ${to}`);
  }
  return to;
}
