/**
 * Incident Repository
 * Handles persistent storage and retrieval of canonical FraudIncidents.
 */

import { FraudIncident, OPEN_INCIDENT_STATES } from "@raksha/schemas";
import { DatabaseClient, defaultDbClient } from "../db/connection.js";

export interface IIncidentRepository {
  create(incident: FraudIncident): Promise<FraudIncident>;
  findById(id: string): Promise<FraudIncident | null>;
  /**
   * Find the most-recent open incident for a normalized mobile number.
   * "Open" = state is one of OPEN_INCIDENT_STATES.
   * Returns null if no open incident exists.
   */
  findOpenByMobile(normalizedMobile: string): Promise<FraudIncident | null>;
  /**
   * Find the most-recent incident for a mobile (any state).
   * Used by STATUS / tracking lookups after handoff.
   */
  findLatestByMobile(normalizedMobile: string): Promise<FraudIncident | null>;
  update(id: string, updates: Partial<FraudIncident>): Promise<FraudIncident>;
  list(): Promise<FraudIncident[]>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}

export class IncidentRepository implements IIncidentRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || defaultDbClient;
  }

  async create(incident: FraudIncident): Promise<FraudIncident> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const query = `
        INSERT INTO incidents (
          id, protocol_version, type, state, narrative_text, narrative_source,
          reporter_mobile, reporter_name, reporter_language, reporter_state, reporter_district,
          transaction_amount, transaction_currency, transaction_id, transaction_timestamp,
          debit_institution, beneficiary_identifier, beneficiary_institution, transaction_channel,
          validation_status, validation_missing_fields, validation_conflicts, validation_next_question,
          validation_context_captured, validation_facts_confirmed, validation_proof_verified,
          handoff_target, handoff_status, handoff_external_reference,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
        ) RETURNING *;
      `;
      await pool.query(query, [
        incident.id,
        incident.protocolVersion,
        incident.type,
        incident.state,
        incident.narrative.text,
        incident.narrative.source,
        incident.reporter.mobile || null,
        incident.reporter.name || null,
        incident.reporter.preferredLanguage || "en",
        incident.reporter.state || null,
        incident.reporter.district || null,
        incident.transaction.amount || null,
        incident.transaction.currency || "INR",
        incident.transaction.transactionId || null,
        incident.transaction.timestamp || null,
        incident.transaction.debitInstitution || null,
        incident.transaction.beneficiaryIdentifier || null,
        incident.transaction.beneficiaryInstitution || null,
        incident.transaction.channel || "UPI",
        incident.validation.status,
        JSON.stringify(incident.validation.missingFields),
        JSON.stringify(incident.validation.conflicts),
        incident.validation.nextQuestion || null,
        !!incident.validation.contextCaptured,
        !!incident.validation.factsConfirmed,
        !!incident.validation.proofVerified,
        incident.handoff.target || "portal-a",
        incident.handoff.status || "NOT_STARTED",
        incident.handoff.externalReference || null,
        incident.createdAt,
        incident.updatedAt,
      ]);
    } else {
      this.db.getData().incidents[incident.id] = incident;
      this.db.persistToDisk();
    }
    return incident;
  }

  async findOpenByMobile(normalizedMobile: string): Promise<FraudIncident | null> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query(
        `SELECT * FROM incidents
         WHERE reporter_mobile = $1
           AND state = ANY($2::text[])
         ORDER BY created_at DESC
         LIMIT 1`,
        [normalizedMobile, OPEN_INCIDENT_STATES]
      );
      if (res.rows.length === 0) return null;
      return this.mapRowToIncident(res.rows[0]);
    } else {
      // Force a fresh read from disk so restarts and concurrent callers see current state
      await this.db.ensureSchema();
      const data = this.db.getData();
      const all = Object.values(data.incidents ?? {}) as FraudIncident[];
      const openStatesSet = new Set<string>(OPEN_INCIDENT_STATES);
      const open = all
        .filter(
          (inc) => {
            // Compare after normalizing both sides to ensure format-agnostic match
            const incMobile = inc.reporter?.mobile
              ? inc.reporter.mobile.replace(/\D/g, "")
              : "";
            const queryMobile = normalizedMobile.replace(/\D/g, "");
            return (
              incMobile === queryMobile &&
              openStatesSet.has(inc.state)
            );
          }
        )
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return open[0] ?? null;
    }
  }

  async findLatestByMobile(normalizedMobile: string): Promise<FraudIncident | null> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query(
        `SELECT * FROM incidents
         WHERE reporter_mobile = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [normalizedMobile]
      );
      if (res.rows.length === 0) return null;
      return this.mapRowToIncident(res.rows[0]);
    } else {
      await this.db.ensureSchema();
      const data = this.db.getData();
      const all = Object.values(data.incidents ?? {}) as FraudIncident[];
      const queryMobile = normalizedMobile.replace(/\D/g, "");
      const matches = all
        .filter((inc) => {
          const incMobile = inc.reporter?.mobile
            ? inc.reporter.mobile.replace(/\D/g, "")
            : "";
          return incMobile === queryMobile;
        })
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return matches[0] ?? null;
    }
  }

  async findById(id: string): Promise<FraudIncident | null> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM incidents WHERE id = $1", [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToIncident(res.rows[0]);
    } else {
      this.db.reloadFromDisk();
      const inc = this.db.getData().incidents[id] as FraudIncident | undefined;
      return inc || null;
    }
  }

  async update(id: string, updates: Partial<FraudIncident>): Promise<FraudIncident> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Incident not found for update: ${id}`);
    }

    const merged: FraudIncident = {
      ...existing,
      ...updates,
      narrative: { ...existing.narrative, ...(updates.narrative || {}) },
      reporter: { ...existing.reporter, ...(updates.reporter || {}) },
      transaction: { ...existing.transaction, ...(updates.transaction || {}) },
      validation: { ...existing.validation, ...(updates.validation || {}) },
      handoff: { ...existing.handoff, ...(updates.handoff || {}) },
      fraudCategory: updates.fraudCategory !== undefined ? updates.fraudCategory : existing.fraudCategory,
      scamSummary: updates.scamSummary !== undefined ? updates.scamSummary : existing.scamSummary,
      updatedAt: new Date().toISOString(),
    };

    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const query = `
        UPDATE incidents SET
          state = $1, narrative_text = $2, reporter_mobile = $3,
          transaction_amount = $4, transaction_id = $5,
          validation_status = $6, validation_missing_fields = $7,
          validation_conflicts = $8, validation_next_question = $9,
          validation_context_captured = $10, validation_facts_confirmed = $11,
          validation_proof_verified = $12,
          debit_institution = $13,
          handoff_status = $14, handoff_external_reference = $15,
          updated_at = $16
        WHERE id = $17 RETURNING *;
      `;
      await pool.query(query, [
        merged.state,
        merged.narrative.text,
        merged.reporter.mobile || null,
        merged.transaction.amount || null,
        merged.transaction.transactionId || null,
        merged.validation.status,
        JSON.stringify(merged.validation.missingFields),
        JSON.stringify(merged.validation.conflicts || []),
        merged.validation.nextQuestion || null,
        !!merged.validation.contextCaptured,
        !!merged.validation.factsConfirmed,
        !!merged.validation.proofVerified,
        merged.transaction.debitInstitution || null,
        merged.handoff.status,
        merged.handoff.externalReference || null,
        merged.updatedAt,
        id,
      ]);
    } else {
      this.db.getData().incidents[id] = merged;
      this.db.persistToDisk();
    }

    return merged;
  }

  async list(): Promise<FraudIncident[]> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("SELECT * FROM incidents ORDER BY created_at DESC");
      return res.rows.map((r) => this.mapRowToIncident(r));
    } else {
      this.db.reloadFromDisk();
      return Object.values(this.db.getData().incidents) as FraudIncident[];
    }
  }

  async delete(id: string): Promise<boolean> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      const res = await pool.query("DELETE FROM incidents WHERE id = $1", [id]);
      return (res.rowCount ?? 0) > 0;
    } else {
      delete this.db.getData().incidents[id];
      this.db.persistToDisk();
      return true;
    }
  }

  async clear(): Promise<void> {
    if (this.db.isPg()) {
      const pool = this.db.getPool()!;
      await pool.query("DELETE FROM incidents;");
    } else {
      this.db.getData().incidents = {};
      this.db.persistToDisk();
    }
  }

  private mapRowToIncident(row: any): FraudIncident {
    return {
      id: row.id,
      protocolVersion: row.protocol_version || "raksha/0.1",
      type: row.type || "FINANCIAL_CYBER_FRAUD",
      state: row.state,
      narrative: {
        text: row.narrative_text,
        source: row.narrative_source,
      },
      reporter: {
        mobile: row.reporter_mobile,
        name: row.reporter_name,
        preferredLanguage: row.reporter_language,
        state: row.reporter_state,
        district: row.reporter_district,
      },
      transaction: {
        amount: row.transaction_amount ? Number(row.transaction_amount) : undefined,
        currency: row.transaction_currency || "INR",
        transactionId: row.transaction_id,
        timestamp: row.transaction_timestamp?.toISOString ? row.transaction_timestamp.toISOString() : row.transaction_timestamp,
        debitInstitution: row.debit_institution,
        beneficiaryIdentifier: row.beneficiary_identifier,
        beneficiaryInstitution: row.beneficiary_institution,
        channel: row.transaction_channel,
      },
      evidence: [],
      validation: {
        status: row.validation_status || "PENDING",
        missingFields: typeof row.validation_missing_fields === "string" ? JSON.parse(row.validation_missing_fields) : (row.validation_missing_fields || []),
        conflicts: typeof row.validation_conflicts === "string" ? JSON.parse(row.validation_conflicts) : (row.validation_conflicts || []),
        nextQuestion: row.validation_next_question,
        contextCaptured: !!row.validation_context_captured,
        factsConfirmed: !!row.validation_facts_confirmed,
        proofVerified: !!row.validation_proof_verified,
      },
      handoff: {
        target: row.handoff_target || "portal-a",
        status: row.handoff_status || "NOT_STARTED",
        externalReference: row.handoff_external_reference,
        submittedAt: row.handoff_submitted_at,
        acknowledgedAt: row.handoff_acknowledged_at,
      },
      createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
    };
  }
}

export const defaultIncidentRepository = new IncidentRepository();
