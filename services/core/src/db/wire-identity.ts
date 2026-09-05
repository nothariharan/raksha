/**
 * Wire EventBus + schema sync so production/gateway never use RAM-only ID counters.
 */

import { globalEventBus } from "@raksha/shared";
import { DatabaseClient, defaultDbClient } from "./connection.js";
import { IdentityAllocator, defaultIdentityAllocator } from "./identity-allocator.js";

export async function wirePersistentIdentity(
  db: DatabaseClient = defaultDbClient,
  ids: IdentityAllocator = defaultIdentityAllocator
): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await db.ensureSchema();
      await ids.syncSequences();
      globalEventBus.setIdFactory(() => ids.allocateEventId("EVT"));
      return;
    } catch (err) {
      lastErr = err;
      const code = (err as { code?: string })?.code;
      const msg = (err as Error)?.message || "";
      const deadlock = code === "40P01" || /deadlock detected/i.test(msg);
      if (!deadlock || attempt === 3) break;
      console.warn(
        `[wirePersistentIdentity] schema deadlock (attempt ${attempt}/3), retrying…`
      );
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  throw lastErr;
}
