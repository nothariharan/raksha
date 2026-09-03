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
  await db.ensureSchema();
  await ids.syncSequences();
  globalEventBus.setIdFactory(() => ids.allocateEventId("EVT"));
}
