/**
 * Demo-only: backdate 1930/CAP case-clock so STATUS offers follow-up.
 */

import { normalizeMobile } from "@raksha/shared";
import { defaultDbClient } from "../db/connection.js";
import {
  defaultEventRepository,
  defaultIncidentRepository,
} from "../repositories/index.js";
import { CASE_CLOCK_EVENT_TYPES } from "../orchestration/citizen-case-view.js";

function backdateIso(iso: string | undefined, shift: number): string | undefined {
  if (!iso) return iso;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t - shift).toISOString();
}

export async function backdateCaseClockForMobile(input: {
  mobile: string;
  days?: number;
  incidentId?: string;
}): Promise<{
  ok: boolean;
  incidentId?: string;
  externalReference?: string;
  lastUpdateAt?: string;
  days?: number;
  error?: string;
}> {
  const days = Number.isFinite(input.days) ? Number(input.days) : 14;
  const shiftMs = days * 24 * 60 * 60 * 1000;
  const mobile = normalizeMobile(input.mobile);
  await defaultDbClient.ensureSchema();

  let incident = input.incidentId
    ? await defaultIncidentRepository.findById(input.incidentId)
    : null;
  if (!incident) {
    const all = await defaultIncidentRepository.list();
    const candidates = all
      .filter((inc) => normalizeMobile(inc.reporter?.mobile || "") === mobile)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    incident = candidates[0] || null;
  }
  if (!incident) {
    return { ok: false, error: `No incident found for mobile ${mobile}` };
  }

  const events = await defaultEventRepository.findByIncidentId(incident.id);
  const targetLast = new Date(Date.now() - shiftMs).toISOString();

  if (defaultDbClient.isPg()) {
    const pool = defaultDbClient.getPool()!;
    for (const ev of events) {
      if (!CASE_CLOCK_EVENT_TYPES.has(String(ev.type))) continue;
      await pool.query(`UPDATE events SET timestamp = $1 WHERE id = $2`, [
        backdateIso(ev.timestamp, shiftMs) || targetLast,
        ev.id,
      ]);
    }
  } else {
    const data = defaultDbClient.getData();
    data.events = (data.events || []).map((raw) => {
      const ev = raw as { id: string; type: string; timestamp: string; incidentId?: string };
      if (ev.incidentId !== incident!.id) return raw;
      if (!CASE_CLOCK_EVENT_TYPES.has(String(ev.type))) return raw;
      return { ...ev, timestamp: backdateIso(ev.timestamp, shiftMs) || targetLast };
    });
    defaultDbClient.persistToDisk();
  }

  await defaultIncidentRepository.update(incident.id, {
    updatedAt: targetLast,
    handoff: {
      ...incident.handoff,
      submittedAt: backdateIso(incident.handoff?.submittedAt, shiftMs) || targetLast,
      acknowledgedAt: backdateIso(incident.handoff?.acknowledgedAt, shiftMs) || targetLast,
      nextRequiredAction: "Citizen may authorize follow-up if no new 1930 response",
    },
  });

  return {
    ok: true,
    incidentId: incident.id,
    externalReference: incident.handoff?.externalReference,
    lastUpdateAt: targetLast,
    days,
  };
}
