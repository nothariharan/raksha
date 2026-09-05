/**
 * Minute-2 time jump: backdate the 1930/CAP case clock so STATUS offers follow-up.
 *
 * Usage:
 *   pnpm exec tsx scripts/demo-stale.ts [mobile] [days]
 *
 * Default: +919876543210, 14 days.
 * Live Render: POST /v1/demo/stale with DEMO_MODE=true
 */

import { backdateCaseClockForMobile } from "@raksha/core";
import { normalizeMobile } from "@raksha/shared";

const mobileArg = process.argv[2] || "+919876543210";
const days = Number(process.argv[3] || "14");
const mobile = normalizeMobile(mobileArg);

async function main(): Promise<void> {
  const result = await backdateCaseClockForMobile({ mobile, days });
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(`Backdated case clock for ${result.incidentId} (${mobile}) by ${result.days} days.`);
  console.log(`Last update ≈ ${String(result.lastUpdateAt).slice(0, 10)}`);
  console.log(`Reply STATUS on WhatsApp/Phone/Web to offer follow-up.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
