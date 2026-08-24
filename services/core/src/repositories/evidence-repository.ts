/**
 * Evidence Repository
 * Persistent storage for evidence items and sealed capsules.
 */

import { EvidenceCapsule, EvidenceReference, PROTOCOL_VERSION } from "@raksha/schemas";
import { computeEvidenceCapsuleDigest } from "@raksha/shared";
import { DatabaseClient, defaultDbClient } from "../db/connection.js";

export interface IEvidenceRepository {
  create(evidence: EvidenceReference): Promise<EvidenceReference>;
  findById(id: string): Promise<EvidenceReference | null>;
  findByIncidentId(incidentId: string): Promise<EvidenceReference[]>;
  sealCapsule(incidentId: string): Promise<EvidenceCapsule>;
  getCapsule(incidentId: string): Promise<EvidenceCapsule | null>;
  clear(): Promise<void>;
}

export class EvidenceRepository implements IEvidenceRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || defaultDbClient;
  }

  async create(evidence: EvidenceReference): Promise<EvidenceReference> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const query = `
        INSERT INTO evidence (id, incident_id, type, uri, sha256, mime_type, metadata, captured_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      await pool.query(query, [
        evidence.id,
        evidence.incidentId,
        evidence.type,
        evidence.uri,
        evidence.sha256,
        evidence.mimeType || null,
        JSON.stringify(evidence.metadata || {}),
        evidence.capturedAt,
      ]);
    } else {
      this.db.getData().evidence[evidence.id] = evidence;
      this.db.persistToDisk();
    }
    return evidence;
  }

  async findById(id: string): Promise<EvidenceReference | null> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM evidence WHERE id = $1", [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToEvidence(res.rows[0]);
    } else {
      this.db.reloadFromDisk();
      const ev = this.db.getData().evidence[id] as EvidenceReference | undefined;
      return ev || null;
    }
  }

  async findByIncidentId(incidentId: string): Promise<EvidenceReference[]> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM evidence WHERE incident_id = $1 ORDER BY captured_at ASC", [incidentId]);
      return res.rows.map((r) => this.mapRowToEvidence(r));
    } else {
      this.db.reloadFromDisk();
      return (Object.values(this.db.getData().evidence) as EvidenceReference[]).filter(
        (e) => e.incidentId === incidentId
      );
    }
  }

  async sealCapsule(incidentId: string): Promise<EvidenceCapsule> {
    const items = await this.findByIncidentId(incidentId);
    const hashes = items.map((i) => i.sha256);
    const hashDigest = computeEvidenceCapsuleDigest(hashes);

    const capsule: EvidenceCapsule = {
      incidentId,
      protocolVersion: PROTOCOL_VERSION,
      sealedAt: new Date().toISOString(),
      items,
      hashDigest,
    };

    return capsule;
  }

  async getCapsule(incidentId: string): Promise<EvidenceCapsule | null> {
    const items = await this.findByIncidentId(incidentId);
    if (items.length === 0) return null;
    return this.sealCapsule(incidentId);
  }

  async clear(): Promise<void> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      await pool.query("DELETE FROM evidence;");
    } else {
      this.db.getData().evidence = {};
      this.db.persistToDisk();
    }
  }

  private mapRowToEvidence(row: any): EvidenceReference {
    return {
      id: row.id,
      incidentId: row.incident_id,
      type: row.type,
      uri: row.uri,
      sha256: row.sha256,
      mimeType: row.mime_type,
      capturedAt: row.captured_at?.toISOString ? row.captured_at.toISOString() : row.captured_at,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : (row.metadata || {}),
    };
  }
}

export const defaultEvidenceRepository = new EvidenceRepository();
