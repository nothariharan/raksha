/**
 * Environment Variable Loader for Raksha Monorepo
 * Loads `.env.local` and `.env` files from project root if present without external dependencies.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

export function loadEnv(rootDir: string = process.cwd()): Record<string, string> {
  const envFiles = [".env.local", ".env"];
  const loaded: Record<string, string> = {};

  for (const file of envFiles) {
    let targetPath = join(rootDir, file);
    if (!existsSync(targetPath)) {
      // Check parent directory if called from apps/*, services/*, or agents/*
      targetPath = resolve(rootDir, "..", file);
      if (!existsSync(targetPath)) {
        targetPath = resolve(rootDir, "..", "..", file);
      }
    }

    if (existsSync(targetPath)) {
      try {
        const content = readFileSync(targetPath, "utf-8");
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
              loaded[key] = val;
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }
  }

  return loaded;
}

// Auto-load on import
loadEnv();
