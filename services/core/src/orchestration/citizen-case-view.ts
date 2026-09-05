/**
 * Citizen-facing projection of a filed case.
 * Core IncidentState stays as-is; this maps events into demo language for Track → Understand → Follow up.
 */

import { CAPEvent, FraudIncident } from "@raksha/schemas";

/** Visible simulation boundary — reused across channels and portals. */
export const SIMULATION_LABEL =
  "Simulated downstream service — 1930 / bank response for prototype";

export const SYNTHETIC_DATA_NOTE =
  "Synthetic demo data only. Inference, voice, and database may run outside India.";

/** 1930 / CAP case clock — Portal B bank lien does not reset staleness. */
export const CASE_CLOCK_EVENT_TYPES = new Set([
  "incident.submitted",
  "incident.accepted",
  "service.accepted",
  "case.followed_up",
]);

export type CitizenStatus =
  | "INTAKE"
  | "SUBMITTED"
  | "ACKNOWLEDGED"
  | "AWAITING_RESPONSE"
  | "FOLLOW_UP_AVAILABLE"
  | "FOLLOW_UP_SENT"
  | "RESOLVED"
  | "IN_REVIEW";

export interface CitizenTimelineRow {
  at: string;
  label: string;
  eventType?: string;
}

export interface CitizenCaseView {
  incidentId: string;
  citizenStatus: CitizenStatus;
  reportedAt: string;
  lastUpdateAt: string;
  daysSinceUpdate: number;
  externalReference?: string;
  followUpAvailable: boolean;
  followUpSent: boolean;
  timeline: CitizenTimelineRow[];
  spokenStatus: string;
  promptFollowUp: string;
  simulationLabel: string;
  syntheticDataNote: string;
  incident: FraudIncident;
}

const DEFAULT_FOLLOW_UP_AFTER_MS = 14 * 24 * 60 * 60 * 1000;

export function followUpThresholdMs(nowMs = Date.now()): number {
  const raw = process.env.RAKSHA_FOLLOW_UP_AFTER_MS;
  if (raw && /^\d+$/.test(raw.trim())) return Number(raw.trim());
  // Live Render demos: offer follow-up after a short wait so Minute 2 works without a time-jump.
  if (
    /^(1|true|yes)$/i.test(String(process.env.DEMO_MODE ?? "").trim()) ||
    Boolean(process.env.RENDER) ||
    process.env.RAKSHA_UNIFIED_HOST === "1"
  ) {
    void nowMs;
    return 60 * 1000; // 1 minute
  }
  void nowMs;
  return DEFAULT_FOLLOW_UP_AFTER_MS;
}

function eventLabel(type: string): string {
  switch (type) {
    case "incident.created":
      return "Report started";
    case "incident.ready":
      return "Details verified";
    case "incident.submitted":
    case "incident.accepted":
      return "Report received by simulated 1930";
    case "service.accepted":
      return "Acknowledged by simulated 1930 desk";
    case "case.followed_up":
      return "Citizen follow-up received";
    case "response.acknowledged":
      return "Simulated bank response recorded";
    case "evidence.sealed":
      return "Evidence sealed";
    default:
      return type.replace(/\./g, " ");
  }
}

function caseClockEvents(events: CAPEvent[]): CAPEvent[] {
  return events
    .filter((e) => CASE_CLOCK_EVENT_TYPES.has(String(e.type)))
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
}

function daysBetween(fromIso: string, toMs: number): number {
  const from = Date.parse(fromIso);
  if (!Number.isFinite(from)) return 0;
  return Math.max(0, Math.floor((toMs - from) / (24 * 60 * 60 * 1000)));
}

function spokenFor(
  lang: string,
  status: CitizenStatus,
  incident: FraudIncident,
  daysSinceUpdate: number,
  ref?: string
): { spokenStatus: string; promptFollowUp: string } {
  const id = incident.id;
  const refBit = ref ? ` Tracking reference ${ref}.` : "";
  if (lang === "hi") {
    if (status === "FOLLOW_UP_AVAILABLE") {
      return {
        spokenStatus: `आपकी रिपोर्ट ${id} दर्ज है।${refBit} पिछले ${daysSinceUpdate} दिनों से कोई नई प्रतिक्रिया दर्ज नहीं हुई है।`,
        promptFollowUp: "क्या आप चाहेंगे कि मैं फॉलो अप करूँ?",
      };
    }
    if (status === "FOLLOW_UP_SENT") {
      return {
        spokenStatus: `आपकी रिपोर्ट ${id} सक्रिय है।${refBit} नागरिक फॉलो अप दर्ज हो चुका है। केस सक्रिय रहता है।`,
        promptFollowUp: "",
      };
    }
    return {
      spokenStatus: `आपकी रिपोर्ट ${id} की स्थिति ${status} है।${refBit}`,
      promptFollowUp: "",
    };
  }
  if (lang === "ta") {
    if (status === "FOLLOW_UP_AVAILABLE") {
      return {
        spokenStatus: `உங்கள் புகார் ${id} பதிவு செய்யப்பட்டுள்ளது.${refBit} கடந்த ${daysSinceUpdate} நாட்களாக புதிய பதில் பதிவு செய்யப்படவில்லை.`,
        promptFollowUp: "நான் பின்தொடர வேண்டுமா?",
      };
    }
    if (status === "FOLLOW_UP_SENT") {
      return {
        spokenStatus: `உங்கள் புகார் ${id} செயலில் உள்ளது.${refBit} குடிமகன் பின்தொடர்தல் பதிவு செய்யப்பட்டது.`,
        promptFollowUp: "",
      };
    }
    return {
      spokenStatus: `உங்கள் புகார் ${id} நிலை ${status}.${refBit}`,
      promptFollowUp: "",
    };
  }

  if (status === "FOLLOW_UP_AVAILABLE") {
    return {
      spokenStatus: `Your report ${id} was filed.${refBit} No new response has been recorded for ${daysSinceUpdate} days.`,
      promptFollowUp: "Would you like me to follow up?",
    };
  }
  if (status === "FOLLOW_UP_SENT") {
    return {
      spokenStatus: `Your report ${id} remains active.${refBit} A citizen follow-up has been recorded. Your case remains active.`,
      promptFollowUp: "",
    };
  }
  if (status === "ACKNOWLEDGED" || status === "AWAITING_RESPONSE") {
    return {
      spokenStatus: `Your report ${id} was acknowledged.${refBit} We are waiting for a further response from the simulated 1930 desk. A typical institutional response can take several weeks; many cases take around 4–8 weeks. No follow-up is required from you right now.`,
      promptFollowUp: "",
    };
  }
  if (status === "SUBMITTED") {
    return {
      spokenStatus: `Your report ${id} has been submitted.${refBit} It is with the simulated 1930 desk. Typical response time is several weeks (often around 4–8 weeks). No follow-up is required from you right now.`,
      promptFollowUp: "",
    };
  }
  return {
    spokenStatus: `Your case ${id} is ${status}.${refBit}`,
    promptFollowUp: "",
  };
}

/**
 * Build the citizen case view from a Core incident and its CAP/audit events.
 * Stale clock uses only 1930/CAP case events — bank lien does not count as a 1930 response.
 */
export function buildCitizenCaseView(input: {
  incident: FraudIncident;
  events?: CAPEvent[];
  language?: string;
  now?: Date | number;
  followUpAfterMs?: number;
}): CitizenCaseView {
  const incident = input.incident;
  const events = [...(input.events || [])].sort((a, b) =>
    String(a.timestamp).localeCompare(String(b.timestamp))
  );
  const nowMs = typeof input.now === "number" ? input.now : (input.now || new Date()).getTime();
  const threshold = input.followUpAfterMs ?? followUpThresholdMs(nowMs);
  const lang = (input.language || incident.reporter?.preferredLanguage || "en").slice(0, 2);
  const ref = incident.handoff?.externalReference;
  const clock = caseClockEvents(events);
  const followedUp = events.some((e) => e.type === "case.followed_up");
  const lastClock = clock.length ? clock[clock.length - 1] : null;
  const lastUpdateAt =
    lastClock?.timestamp ||
    incident.handoff?.acknowledgedAt ||
    incident.handoff?.submittedAt ||
    incident.updatedAt ||
    incident.createdAt;
  const reportedAt =
    incident.handoff?.submittedAt ||
    clock.find((e) => e.type === "incident.accepted" || e.type === "incident.submitted")?.timestamp ||
    incident.createdAt;
  const daysSinceUpdate = daysBetween(lastUpdateAt, nowMs);
  const ageMs = nowMs - (Date.parse(lastUpdateAt) || nowMs);
  const filed =
    incident.state === "SUBMITTED" ||
    incident.state === "ACKNOWLEDGED" ||
    incident.state === "FOLLOW_UP_REQUIRED" ||
    incident.state === "TRACKING" ||
    !!ref;

  let citizenStatus: CitizenStatus;
  let followUpAvailable = false;

  if (!filed && !["SUBMITTED", "ACKNOWLEDGED", "FOLLOW_UP_REQUIRED", "TRACKING"].includes(incident.state)) {
    citizenStatus = "INTAKE";
  } else if (followedUp || incident.state === "FOLLOW_UP_REQUIRED") {
    citizenStatus = "FOLLOW_UP_SENT";
  } else if (filed && ageMs >= threshold) {
    citizenStatus = "FOLLOW_UP_AVAILABLE";
    followUpAvailable = true;
  } else if (incident.state === "ACKNOWLEDGED" || events.some((e) => e.type === "service.accepted")) {
    citizenStatus = "AWAITING_RESPONSE";
  } else if (incident.state === "SUBMITTED" || !!ref) {
    citizenStatus = "SUBMITTED";
  } else {
    citizenStatus = "ACKNOWLEDGED";
  }

  const timeline: CitizenTimelineRow[] = events
    .filter((e) =>
      [
        "incident.created",
        "incident.ready",
        "incident.submitted",
        "incident.accepted",
        "service.accepted",
        "case.followed_up",
        "response.acknowledged",
        "evidence.sealed",
      ].includes(String(e.type))
    )
    .map((e) => ({
      at: e.timestamp,
      label: eventLabel(String(e.type)),
      eventType: String(e.type),
    }));

  if (!timeline.length && filed) {
    timeline.push({
      at: reportedAt,
      label: "Report received by simulated 1930",
      eventType: "incident.accepted",
    });
  }

  const { spokenStatus, promptFollowUp } = spokenFor(
    lang,
    citizenStatus,
    incident,
    Math.max(daysSinceUpdate, Math.floor(threshold / (24 * 60 * 60 * 1000)) || 14),
    ref
  );

  return {
    incidentId: incident.id,
    citizenStatus,
    reportedAt,
    lastUpdateAt,
    daysSinceUpdate: followUpAvailable
      ? Math.max(daysSinceUpdate, Math.floor(threshold / (24 * 60 * 60 * 1000)) || 14)
      : daysSinceUpdate,
    externalReference: ref,
    followUpAvailable,
    followUpSent: followedUp || incident.state === "FOLLOW_UP_REQUIRED",
    timeline,
    spokenStatus: followUpAvailable ? `${spokenStatus} ${promptFollowUp}`.trim() : spokenStatus,
    promptFollowUp,
    simulationLabel: SIMULATION_LABEL,
    syntheticDataNote: SYNTHETIC_DATA_NOTE,
    incident,
  };
}

export function formatCitizenStatusWhatsApp(view: CitizenCaseView): string {
  const inc = view.incident;
  const amt = inc.transaction?.amount;
  const bank = inc.transaction?.debitInstitution || "—";
  const utr = inc.transaction?.transactionId || "—";

  function isPublicHttpUrl(url?: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return (
        (parsed.protocol === "https:" || parsed.protocol === "http:") &&
        !/^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)
      );
    } catch {
      return false;
    }
  }
  const origin = (process.env.PROTOCOL_PUBLIC_ORIGIN || "").replace(/\/$/, "");
  const envA = (process.env.PORTAL_A_BASE_URL || "").replace(/\/$/, "");
  const envB = (process.env.PORTAL_B_BASE_URL || "").replace(/\/$/, "");
  const portalA = isPublicHttpUrl(envA)
    ? envA
    : isPublicHttpUrl(origin)
      ? `${origin}/portal-a`
      : "http://localhost:3003";
  const portalB = isPublicHttpUrl(envB)
    ? envB
    : isPublicHttpUrl(origin)
      ? `${origin}/portal-b`
      : "http://localhost:3004";

  const lines = [
    `🛡️ *Raksha Case Status*`,
    ``,
    `Case ID: *${view.incidentId}*`,
    `Status: *${view.citizenStatus}*`,
    view.externalReference ? `Tracking Ref: *${view.externalReference}*` : null,
    `Reported: *${view.reportedAt.slice(0, 16).replace("T", " ")} UTC*`,
    `Last update: *${view.lastUpdateAt.slice(0, 16).replace("T", " ")} UTC* (${view.daysSinceUpdate} days ago)`,
    amt != null ? `• Amount: *₹${Number(amt).toLocaleString("en-IN")}*` : null,
    `• Bank: *${bank}*`,
    `• UTR: *${utr}*`,
    ``,
    view.spokenStatus,
  ].filter(Boolean) as string[];

  if (view.timeline.length) {
    lines.push(``, `*Timeline*`);
    for (const row of view.timeline.slice(-6)) {
      lines.push(`• ${row.at.slice(0, 10)} — ${row.label}`);
    }
  }

  if (view.followUpAvailable) {
    // prompt already included in spokenStatus
  } else if (
    view.citizenStatus === "SUBMITTED" ||
    view.citizenStatus === "ACKNOWLEDGED" ||
    view.citizenStatus === "AWAITING_RESPONSE"
  ) {
    lines.push(
      ``,
      `*What this means*`,
      `• Follow-up / escalation is *not* required right now.`,
      `• Typical desk response window: *several weeks* (often ~4–8 weeks).`,
      `• Don't worry — Raksha will *notify you here* if there is an update on this case.`
    );
  } else if (view.citizenStatus === "FOLLOW_UP_SENT") {
    lines.push(
      ``,
      `Don't worry — Raksha will notify you here if there is a further update.`
    );
  }

  if (view.externalReference) {
    const deskA = `${portalA}/?ref=${encodeURIComponent(view.externalReference)}`;
    lines.push(
      ``,
      `Open desks (simulated):`,
      `• 1930 cyber cell (report filed): ${deskA}`,
      `• ${bank === "—" ? "Bank" : bank} freeze desk: ${portalB}`
    );
  }

  lines.push(``, `_${view.simulationLabel}_`);
  return lines.join("\n");
}
