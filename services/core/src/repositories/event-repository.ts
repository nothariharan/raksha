/**
 * Event Repository
 * Persistent append-only event log for Raksha & CAP.
 */

import { CAPEvent } from "@raksha/schemas";
import { DatabaseClient, defaultDbClient } from "../db/connection.js";

export interface IEventRepository {
  append(event: CAPEvent): Promise<CAPEvent>;
  findByCaseId(caseId: string): Promise<CAPEvent[]>;
  findByIncidentId(incidentId: string): Promise<CAPEvent[]>;
  list(filter?: { caseId?: string; incidentId?: string; type?: string; since?: string }): Promise<CAPEvent[]>;
  clear(): Promise<void>;
}

export class EventRepository implements IEventRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || defaultDbClient;
  }

  async append(event: CAPEvent): Promise<CAPEvent> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const query = `
        INSERT INTO events (id, type, case_id, incident_id, source, payload, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      await pool.query(query, [
        event.id,
        event.type,
        event.caseId,
        event.incidentId || null,
        event.source,
        JSON.stringify(event.payload || {}),
        event.timestamp,
      ]);
    } else {
      this.db.getData().events.push(event);
      this.db.persistToDisk();
    }
    return event;
  }

  async findByCaseId(caseId: string): Promise<CAPEvent[]> {
    return this.list({ caseId });
  }

  async findByIncidentId(incidentId: string): Promise<CAPEvent[]> {
    return this.list({ incidentId });
  }

  async list(filter?: {
    caseId?: string;
    incidentId?: string;
    type?: string;
    since?: string;
  }): Promise<CAPEvent[]> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (filter?.caseId) {
        values.push(filter.caseId);
        conditions.push(`case_id = $${values.length}`);
      }
      if (filter?.incidentId) {
        values.push(filter.incidentId);
        conditions.push(`incident_id = $${values.length}`);
      }
      if (filter?.type) {
        values.push(filter.type);
        conditions.push(`type = $${values.length}`);
      }
      if (filter?.since) {
        values.push(filter.since);
        conditions.push(`timestamp > $${values.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const query = `SELECT * FROM events ${whereClause} ORDER BY timestamp ASC;`;
      const res = await pool.query(query, values);
      return res.rows.map((r) => this.mapRowToEvent(r));
    } else {
      this.db.reloadFromDisk();
      return (this.db.getData().events as CAPEvent[]).filter((e) => {
        if (filter?.caseId && e.caseId !== filter.caseId) return false;
        if (filter?.incidentId && e.incidentId !== filter.incidentId) return false;
        if (filter?.type && e.type !== filter.type) return false;
        if (filter?.since && new Date(e.timestamp) <= new Date(filter.since)) return false;
        return true;
      });
    }
  }

  async clear(): Promise<void> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      await pool.query("DELETE FROM events;");
    } else {
      this.db.getData().events = [];
      this.db.persistToDisk();
    }
  }

  private mapRowToEvent(row: any): CAPEvent {
    return {
      id: row.id,
      type: row.type,
      caseId: row.case_id,
      incidentId: row.incident_id,
      source: row.source,
      timestamp: row.timestamp?.toISOString ? row.timestamp.toISOString() : row.timestamp,
      payload: typeof row.payload === "string" ? JSON.parse(row.payload) : (row.payload || {}),
    };
  }
}

export const defaultEventRepository = new EventRepository();
