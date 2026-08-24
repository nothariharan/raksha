/**
 * CAP Action Repository & Idempotency Store
 * Prevents duplicate case creation on webhook retries or parallel submissions.
 */

import { DatabaseClient, defaultDbClient } from "../db/connection.js";

export interface StoredCAPAction {
  id: string;
  actionName: string;
  caseId?: string;
  incidentId?: string;
  status: string;
  idempotencyKey?: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
  executedAt: string;
}

export interface IActionRepository {
  findByIdempotencyKey(key: string): Promise<StoredCAPAction | null>;
  record(action: StoredCAPAction): Promise<void>;
  clear(): Promise<void>;
}

export class ActionRepository implements IActionRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || defaultDbClient;
  }

  async findByIdempotencyKey(key: string): Promise<StoredCAPAction | null> {
    if (!key) return null;
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM cap_actions WHERE idempotency_key = $1", [key]);
      if (res.rows.length === 0) return null;
      return this.mapRowToAction(res.rows[0]);
    } else {
      this.db.reloadFromDisk();
      const actions = Object.values(this.db.getData().cap_actions) as StoredCAPAction[];
      return actions.find((a) => a.idempotencyKey === key) || null;
    }
  }

  async record(action: StoredCAPAction): Promise<void> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const query = `
        INSERT INTO cap_actions (
          id, action_name, case_id, incident_id, status, idempotency_key,
          request_payload, response_payload, executed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (idempotency_key) DO UPDATE SET
          status = EXCLUDED.status,
          response_payload = EXCLUDED.response_payload;
      `;
      await pool.query(query, [
        action.id,
        action.actionName,
        action.caseId || null,
        action.incidentId || null,
        action.status,
        action.idempotencyKey || null,
        JSON.stringify(action.requestPayload || {}),
        JSON.stringify(action.responsePayload || {}),
        action.executedAt,
      ]);
    } else {
      this.db.getData().cap_actions[action.id] = action;
      this.db.persistToDisk();
    }
  }

  async clear(): Promise<void> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      await pool.query("DELETE FROM cap_actions;");
    } else {
      this.db.getData().cap_actions = {};
      this.db.persistToDisk();
    }
  }

  private mapRowToAction(row: any): StoredCAPAction {
    return {
      id: row.id,
      actionName: row.action_name,
      caseId: row.case_id,
      incidentId: row.incident_id,
      status: row.status,
      idempotencyKey: row.idempotency_key,
      requestPayload: typeof row.request_payload === "string" ? JSON.parse(row.request_payload) : (row.request_payload || {}),
      responsePayload: typeof row.response_payload === "string" ? JSON.parse(row.response_payload) : (row.response_payload || {}),
      executedAt: row.executed_at?.toISOString ? row.executed_at.toISOString() : row.executed_at,
    };
  }
}

export const defaultActionRepository = new ActionRepository();
