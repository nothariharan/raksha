import { createHash } from "node:crypto";

export function computeSha256(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

export function computeEvidenceCapsuleDigest(hashes: string[]): string {
  const sorted = [...hashes].sort();
  return createHash("sha256").update(sorted.join(":")).digest("hex");
}
