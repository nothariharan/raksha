/**
 * Raksha Database Connection & Unified Storage Driver
 * Supports Supabase / PostgreSQL when DATABASE_URL is configured,
 * with automatic fallback to persistent JSON disk storage for local dev / testing.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;

export interface DatabaseStoreData {
  incidents: Record<string, unknown>;
  evidence: Record<string, unknown>;
  cap_cases: Record<string, unknown>;
  events: Array<unknown>;
  cap_actions: Record<string, unknown>;
}

export class DatabaseClient {
  private pool: pg.Pool | null = null;
  private filePath: string;
  private memoryData: DatabaseStoreData;
  private isConnectedToPg = false;

  constructor(customStoragePath?: string) {
    this.filePath = customStoragePath || join(process.cwd(), ".data", "raksha-db.json");
    this.memoryData = {
      incidents: {},
      evidence: {},
      cap_cases: {},
      events: [],
      cap_actions: {},
    };

    this.initStorage();
  }

  private initStorage(): void {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

    if (dbUrl && !dbUrl.includes("postgres:postgres@localhost") && !process.env.FORCE_FILE_DB) {
      try {
        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
          max: 10,
          idleTimeoutMillis: 30000,
        });
        this.isConnectedToPg = true;
        console.log("[DatabaseClient] Connected to PostgreSQL / Supabase pool.");
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
          this.memoryData = JSON.parse(raw);
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
        this.memoryData = JSON.parse(raw);
      }
    }
  }

  public clearStorage(): void {
    this.memoryData = {
      incidents: {},
      evidence: {},
      cap_cases: {},
      events: [],
      cap_actions: {},
    };
    this.persistToDisk();
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
