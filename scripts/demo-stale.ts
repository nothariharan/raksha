/**
 * Minute-2 time jump: backdate the 1930/CAP case clock so STATUS offers follow-up.
 *
 * Usage:
 *   pnpm exec tsx scripts/demo-stale.ts [mobile] [days]
 *
 * Default: +919876543210, 14 days.
 * Does not invent institutional failure — only moves last case-clock timestamps.
 */

import {
  defaultDbClient,
  defaultIncidentRepository,
  defaultEventRepository,
  CASE_CLOCK_EVENT_TYPES,
} from "@raksha/core";
import { normalizeMobile } from "@raksha/shared";

const mobileArg = process.argv[2] || "+919876543210";
const days = Number(process.argv[3] || "14");
const mobile = normalizeMobile(mobileArg);
const shiftMs = (Number.isFinite(days) ? days : 14) * 24 * 60 * 60 * 1000;

function backdateIso(iso: string | undefined, shift: number): string | undefined {
  if (!iso) return iso;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t - shift).toISOString();
}

async function main(): Promise<void> {
  await defaultDbClient.ensureSchema();
  const all = await defaultIncidentRepository.list();
  const candidates = all
    .filter((inc) => normalizeMobile(inc.reporter?.mobile || "") === mobile)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const incident = candidates[0];
  if (!incident) {
    console.error(`No incident found for mobile ${mobile}`);
    process.exit(1);
  }

  const events = await defaultEventRepository.findByIncidentId(incident.id);
  const now = Date.now();
  const targetLast = new Date(now - shiftMs).toISOString();

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
    data.events = (data.events || []).map((ev: { id: string; type: string; timestamp: string; incidentId?: string }) => {
      if (ev.incidentId !== incident.id) return ev;
      if (!CASE_CLOCK_EVENT_TYPES.has(String(ev.type))) return ev;
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

  console.log(`Backdated case clock for ${incident.id} (${mobile}) by ${days} days.`);
  console.log(`Last update ≈ ${targetLast.slice(0, 10)}`);
  console.log(`Reply STATUS on WhatsApp/Phone/Web to offer follow-up.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
