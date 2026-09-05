/**
 * Raksha Database Connection & Unified Storage Driver
 * Supports Supabase / PostgreSQL when DATABASE_URL is configured,
 * with automatic fallback to persistent JSON disk storage for local dev / testing.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;

export interface DatabaseSequences {
  incident: number;
  case: number;
  evidence: number;
  event: number;
}

export interface DatabaseStoreData {
  incidents: Record<string, unknown>;
  evidence: Record<string, unknown>;
  cap_cases: Record<string, unknown>;
  events: Array<unknown>;
  cap_actions: Record<string, unknown>;
  /** Last allocated numeric suffix per kind (file DB). Next id = max(seq, rowMax) + 1. */
  sequences?: DatabaseSequences;
}

function emptyStore(): DatabaseStoreData {
  return {
    incidents: {},
    evidence: {},
    cap_cases: {},
    events: [],
    cap_actions: {},
    sequences: { incident: 0, case: 0, evidence: 0, event: 0 },
  };
}

export class DatabaseClient {
  private pool: pg.Pool | null = null;
  private filePath: string;
  private memoryData: DatabaseStoreData;
  private isConnectedToPg = false;

  constructor(customStoragePath?: string) {
    this.filePath = customStoragePath || join(process.cwd(), ".data", "raksha-db.json");
    this.memoryData = emptyStore();

    this.initStorage();
  }

  /** Ensure older file DBs without `sequences` get a zeroed counter map. */
  public ensureSequencesShape(): void {
    if (!this.memoryData.sequences) {
      this.memoryData.sequences = { incident: 0, case: 0, evidence: 0, event: 0 };
    }
  }

  private initStorage(): void {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    const forceFileDb = /^(1|true|yes)$/i.test(String(process.env.FORCE_FILE_DB ?? "").trim());

    if (dbUrl && !dbUrl.includes("postgres:postgres@localhost") && !forceFileDb) {
      try {
        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
          max: 10,
          idleTimeoutMillis: 30000,
        });
        this.isConnectedToPg = true;
        console.log("[DatabaseClient] Connected to PostgreSQL / Supabase pool.");
        this.ensureSchema().catch((err) => {
          console.warn("[DatabaseClient] Postgres schema bootstrap notice:", err.message);
        });
        return;
      } catch (err) {
        console.warn("[DatabaseClient] Failed to initialize PostgreSQL pool, falling back to disk persistence:", err);
      }
    }

    // Disk persistence fallback
    try {
      const dir = dirname(this.filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, "utf-8");
        if (raw.trim()) {
          this.memoryData = { ...emptyStore(), ...JSON.parse(raw) };
          this.ensureSequencesShape();
        }
      } else {
        this.persistToDisk();
      }
      console.log(`[DatabaseClient] Initialized persistent disk storage at: ${this.filePath}`);
    } catch (err) {
      console.error("[DatabaseClient] Disk storage init error:", err);
    }
  }

  public isPg(): boolean {
    return this.isConnectedToPg && this.pool !== null;
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }

  public persistToDisk(): void {
    if (this.isPg()) return;
    try {
      const dir = dirname(this.filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.filePath, JSON.stringify(this.memoryData, null, 2), "utf-8");
    } catch (err) {
      console.error("[DatabaseClient] Error persisting to disk:", err);
    }
  }

  public getData(): DatabaseStoreData {
    return this.memoryData;
  }

  public reloadFromDisk(): void {
    if (existsSync(this.filePath)) {
      const raw = readFileSync(this.filePath, "utf-8");
      if (raw.trim()) {
        this.memoryData = { ...emptyStore(), ...JSON.parse(raw) };
        this.ensureSequencesShape();
      }
    }
  }

  public clearStorage(): void {
    this.memoryData = emptyStore();
    this.persistToDisk();
  }

  public async ensureSchema(): Promise<void> {
    if (this.isPg() && this.pool) {
      const schemaSql = `
      CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR(64) PRIMARY KEY,
        protocol_version VARCHAR(32) NOT NULL DEFAULT 'raksha/0.1',
        type VARCHAR(64) NOT NULL DEFAULT 'FINANCIAL_CYBER_FRAUD',
        state VARCHAR(64) NOT NULL DEFAULT 'INTAKE',
        narrative_text TEXT NOT NULL,
        narrative_source VARCHAR(32) NOT NULL DEFAULT 'web',
        reporter_mobile VARCHAR(32),
        reporter_name VARCHAR(128),
        reporter_language VARCHAR(16) DEFAULT 'en',
        reporter_state VARCHAR(64),
        reporter_district VARCHAR(64),
        transaction_amount NUMERIC(15, 2),
        transaction_currency VARCHAR(8) DEFAULT 'INR',
        transaction_id VARCHAR(128),
        transaction_timestamp TIMESTAMPTZ,
        debit_institution VARCHAR(128),
        beneficiary_identifier VARCHAR(128),
        beneficiary_institution VARCHAR(128),
        transaction_channel VARCHAR(32),
        validation_status VARCHAR(32) DEFAULT 'PENDING',
        validation_missing_fields JSONB DEFAULT '[]'::jsonb,
        validation_conflicts JSONB DEFAULT '[]'::jsonb,
        validation_next_question TEXT,
        handoff_target VARCHAR(64) DEFAULT 'portal-a',
        handoff_status VARCHAR(32) DEFAULT 'NOT_STARTED',
        handoff_external_reference VARCHAR(128),
        handoff_submitted_at TIMESTAMPTZ,
        handoff_acknowledged_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS evidence (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        type VARCHAR(64) NOT NULL,
        uri TEXT NOT NULL,
        sha256 VARCHAR(64) NOT NULL,
        mime_type VARCHAR(64),
        metadata JSONB DEFAULT '{}'::jsonb,
        captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cap_cases (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
        external_reference VARCHAR(128),
        target_service VARCHAR(64) NOT NULL,
        action VARCHAR(64) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(64) NOT NULL,
        case_id VARCHAR(64) NOT NULL,
        incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
        source VARCHAR(64) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cap_actions (
        id VARCHAR(64) PRIMARY KEY,
        action_name VARCHAR(64) NOT NULL,
        case_id VARCHAR(64),
        incident_id VARCHAR(64),
        status VARCHAR(32) NOT NULL,
        idempotency_key VARCHAR(128) UNIQUE,
        request_payload JSONB,
        response_payload JSONB,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_incidents_state ON incidents(state);
      CREATE INDEX IF NOT EXISTS idx_incidents_transaction_id ON incidents(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_incidents_mobile_state ON incidents(reporter_mobile, state) WHERE reporter_mobile IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_evidence_incident_id ON evidence(incident_id);
      CREATE INDEX IF NOT EXISTS idx_cap_cases_incident_id ON cap_cases(incident_id);
      CREATE INDEX IF NOT EXISTS idx_events_case_id ON events(case_id);
      CREATE INDEX IF NOT EXISTS idx_events_incident_id ON events(incident_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS validation_context_captured BOOLEAN DEFAULT false;
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS validation_facts_confirmed BOOLEAN DEFAULT false;
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS validation_proof_verified BOOLEAN DEFAULT false;

      CREATE SEQUENCE IF NOT EXISTS raksha_incident_seq;
      CREATE SEQUENCE IF NOT EXISTS raksha_case_seq;
      CREATE SEQUENCE IF NOT EXISTS raksha_evidence_seq;
      CREATE SEQUENCE IF NOT EXISTS raksha_event_seq;
    `;
      await this.pool.query(schemaSql);
      console.log("[DatabaseClient] PostgreSQL database tables, sequences, and indexes verified.");
    }

    // File and Postgres: align identity sequences past existing row suffixes.
    const { IdentityAllocator } = await import("./identity-allocator.js");
    await new IdentityAllocator(this).syncSequences();
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnectedToPg = false;
    }
  }
}

export const defaultDbClient = new DatabaseClient();
