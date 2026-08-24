/**
 * CAP Case Repository
 * Persistent storage for cases created through CAP actions.
 */

import { CAPCase } from "@raksha/schemas";
import { DatabaseClient, defaultDbClient } from "../db/connection.js";

export interface ICaseRepository {
  create(capCase: CAPCase): Promise<CAPCase>;
  findById(id: string): Promise<CAPCase | null>;
  findByIncidentId(incidentId: string): Promise<CAPCase | null>;
  update(id: string, updates: Partial<CAPCase>): Promise<CAPCase>;
  list(): Promise<CAPCase[]>;
  clear(): Promise<void>;
}

export class CaseRepository implements ICaseRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || defaultDbClient;
  }

  async create(capCase: CAPCase): Promise<CAPCase> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const query = `
        INSERT INTO cap_cases (id, incident_id, status, external_reference, target_service, action, payload, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      await pool.query(query, [
        capCase.id,
        capCase.incidentId,
        capCase.status,
        capCase.externalReference || null,
        capCase.targetService,
        capCase.action,
        JSON.stringify(capCase.payload || {}),
        capCase.createdAt,
        capCase.updatedAt,
      ]);
    } else {
      this.db.getData().cap_cases[capCase.id] = capCase;
      this.db.persistToDisk();
    }
    return capCase;
  }

  async findById(id: string): Promise<CAPCase | null> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM cap_cases WHERE id = $1", [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToCase(res.rows[0]);
    } else {
      this.db.reloadFromDisk();
      const c = this.db.getData().cap_cases[id] as CAPCase | undefined;
      return c || null;
    }
  }

  async findByIncidentId(incidentId: string): Promise<CAPCase | null> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM cap_cases WHERE incident_id = $1 ORDER BY created_at DESC LIMIT 1", [incidentId]);
      if (res.rows.length === 0) return null;
      return this.mapRowToCase(res.rows[0]);
    } else {
      this.db.reloadFromDisk();
      const all = Object.values(this.db.getData().cap_cases) as CAPCase[];
      return all.find((c) => c.incidentId === incidentId) || null;
    }
  }

  async update(id: string, updates: Partial<CAPCase>): Promise<CAPCase> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`CAP Case not found: ${id}`);
    }

    const merged: CAPCase = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const query = `
        UPDATE cap_cases SET status = $1, external_reference = $2, payload = $3, updated_at = $4
        WHERE id = $5 RETURNING *;
      `;
      await pool.query(query, [
        merged.status,
        merged.externalReference || null,
        JSON.stringify(merged.payload || {}),
        merged.updatedAt,
        id,
      ]);
    } else {
      this.db.getData().cap_cases[id] = merged;
      this.db.persistToDisk();
    }
    return merged;
  }

  async list(): Promise<CAPCase[]> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM cap_cases ORDER BY created_at DESC;");
      return res.rows.map((r) => this.mapRowToCase(r));
    } else {
      this.db.reloadFromDisk();
      return Object.values(this.db.getData().cap_cases) as CAPCase[];
    }
  }

  async clear(): Promise<void> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      await pool.query("DELETE FROM cap_cases;");
    } else {
      this.db.getData().cap_cases = {};
      this.db.persistToDisk();
    }
  }

  private mapRowToCase(row: any): CAPCase {
    return {
      id: row.id,
      incidentId: row.incident_id,
      status: row.status,
      externalReference: row.external_reference,
      targetService: row.target_service,
      action: row.action,
      payload: typeof row.payload === "string" ? JSON.parse(row.payload) : (row.payload || {}),
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }
}

export const defaultCaseRepository = new CaseRepository();
