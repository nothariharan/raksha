/**
 * Portal A — synthetic cyber-fraud intake lifecycle.
 * Demo-only; not a real I4C / CFCFRMS investigation workflow.
 */

export const PORTAL_A_STATES = [
  "RECEIVED",
  "VALIDATING",
  "ACCEPTED",
  "UNDER_REVIEW",
  "FORWARDED",
] as const;

export type PortalALifecycle = (typeof PORTAL_A_STATES)[number];

const TRANSITIONS: Record<PortalALifecycle, PortalALifecycle[]> = {
  RECEIVED: ["VALIDATING"],
  VALIDATING: ["ACCEPTED"],
  ACCEPTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["FORWARDED"],
  FORWARDED: [],
};

export function canTransition(from: PortalALifecycle, to: PortalALifecycle): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextLifecycle(from: PortalALifecycle): PortalALifecycle | null {
  return TRANSITIONS[from][0] ?? null;
}

export function transitionLifecycle(
  from: PortalALifecycle,
  to: PortalALifecycle
): PortalALifecycle {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid Portal A transition: ${from} → ${to}`);
  }
  return to;
}
