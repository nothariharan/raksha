/**
 * Collision-safe identity allocator for incidents, cases, evidence, and events.
 * Postgres: SEQUENCE + setval from MAX(suffix). File DB: persisted counters + mutex.
 */

import {
  formatIdentityId,
  parseIdentitySuffix,
  type IdentityKind,
  type IdentityPrefix,
} from "@raksha/shared";
import { DatabaseClient, defaultDbClient, type DatabaseStoreData } from "./connection.js";

const SEQ_NAMES: Record<IdentityKind, string> = {
  incident: "raksha_incident_seq",
  case: "raksha_case_seq",
  evidence: "raksha_evidence_seq",
  event: "raksha_event_seq",
};

const TABLE_FOR_KIND: Record<IdentityKind, string> = {
  incident: "incidents",
  case: "cap_cases",
  evidence: "evidence",
  event: "events",
};

function maxSuffixFromIds(ids: string[]): number {
  let max = 0;
  for (const id of ids) {
    const n = parseIdentitySuffix(id);
    if (n > max) max = n;
  }
  return max;
}

function maxFromFileStore(data: DatabaseStoreData, kind: IdentityKind): number {
  switch (kind) {
    case "incident":
      return maxSuffixFromIds(Object.keys(data.incidents || {}));
    case "case":
      return maxSuffixFromIds(Object.keys(data.cap_cases || {}));
    case "evidence":
      return maxSuffixFromIds(Object.keys(data.evidence || {}));
    case "event": {
      const events = Array.isArray(data.events) ? data.events : [];
      const ids = events
        .map((e) => (e && typeof e === "object" && "id" in e ? String((e as { id: unknown }).id) : ""))
        .filter(Boolean);
      const actionIds = Object.keys(data.cap_actions || {});
      return Math.max(maxSuffixFromIds(ids), maxSuffixFromIds(actionIds));
    }
  }
}

export class IdentityAllocator {
  private db: DatabaseClient;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(db: DatabaseClient = defaultDbClient) {
    this.db = db;
  }

  /** Serialize file-DB allocates so concurrent creates cannot reuse a number. */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.chain.then(fn, fn);
    this.chain = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }

  /**
   * Sync sequences to MAX(numeric suffix) already stored.
   * Empty store → next allocate yields …-000001.
   */
  async syncSequences(): Promise<void> {
    if (this.db.isPg()) {
      const pool = this.db.getPool();
      if (!pool) return;

      for (const kind of Object.keys(SEQ_NAMES) as IdentityKind[]) {
        const table = TABLE_FOR_KIND[kind];
        const seq = SEQ_NAMES[kind];
        const result = await pool.query<{ max: string | null }>(
          `SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM '([0-9]+)$') AS BIGINT)), 0) AS max
           FROM ${table}
           WHERE id ~ '[0-9]+$'`
        );
        const max = Number(result.rows[0]?.max ?? 0);
        if (max <= 0) {
          // next nextval → 1
          await pool.query(`SELECT setval($1::regclass, 1, false)`, [seq]);
        } else {
          // next nextval → max+1
          await pool.query(`SELECT setval($1::regclass, $2::bigint, true)`, [seq, max]);
        }
      }
      return;
    }

    this.db.ensureSequencesShape();
    const data = this.db.getData();
    const sequences = data.sequences!;
    for (const kind of Object.keys(SEQ_NAMES) as IdentityKind[]) {
      const fromRows = maxFromFileStore(data, kind);
      sequences[kind] = Math.max(sequences[kind] ?? 0, fromRows);
    }
    this.db.persistToDisk();
  }

  async allocate(kind: IdentityKind, prefix?: IdentityPrefix): Promise<string> {
    return this.enqueue(async () => {
      if (this.db.isPg()) {
        const pool = this.db.getPool();
        if (!pool) {
          throw new Error("[IdentityAllocator] PostgreSQL pool unavailable");
        }
        const seq = SEQ_NAMES[kind];
        const result = await pool.query<{ n: string }>(`SELECT nextval($1::regclass) AS n`, [seq]);
        const n = Number(result.rows[0].n);
        return formatIdentityId(kind, n, prefix);
      }

      this.db.ensureSequencesShape();
      const data = this.db.getData();
      const sequences = data.sequences!;
      const fromRows = maxFromFileStore(data, kind);
      const next = Math.max(sequences[kind] ?? 0, fromRows) + 1;
      sequences[kind] = next;
      this.db.persistToDisk();
      return formatIdentityId(kind, next, prefix);
    });
  }

  async allocateIncidentId(prefix = "RKS"): Promise<string> {
    return this.allocate("incident", prefix);
  }

  async allocateCaseId(prefix = "CAP"): Promise<string> {
    return this.allocate("case", prefix);
  }

  async allocateEvidenceId(prefix = "EV"): Promise<string> {
    return this.allocate("evidence", prefix);
  }

  async allocateEventId(prefix: IdentityPrefix = "EVT"): Promise<string> {
    return this.allocate("event", prefix);
  }

  /** Peek next incident number without consuming (after sync). */
  async peekNextIncidentNumber(): Promise<number> {
    if (this.db.isPg()) {
      const pool = this.db.getPool();
      if (!pool) return 1;
      const result = await pool.query<{ last: string; called: boolean }>(
        `SELECT last_value AS last, is_called AS called FROM raksha_incident_seq`
      );
      const last = Number(result.rows[0]?.last ?? 0);
      const called = Boolean(result.rows[0]?.called);
      return called ? last + 1 : Math.max(last, 1);
    }
    this.db.ensureSequencesShape();
    const data = this.db.getData();
    const fromRows = maxFromFileStore(data, "incident");
    return Math.max(data.sequences!.incident ?? 0, fromRows) + 1;
  }
}

export const defaultIdentityAllocator = new IdentityAllocator(defaultDbClient);
