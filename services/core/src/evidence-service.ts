/**
 * Evidence Service for Raksha Core
 * Manages evidence ingestion, SHA-256 integrity verification, and Evidence Capsule creation.
 */

import {
  CreateEvidenceInput,
  EvidenceCapsule,
  EvidenceReference,
  PROTOCOL_VERSION,
} from "@raksha/schemas";
import {
  computeEvidenceCapsuleDigest,
  computeSha256,
  generateEvidenceId,
  globalEventBus,
} from "@raksha/shared";

export class EvidenceService {
  private evidenceStore: Map<string, EvidenceReference> = new Map();
  private capsules: Map<string, EvidenceCapsule> = new Map();

  async addEvidence(input: CreateEvidenceInput): Promise<EvidenceReference> {
    const id = generateEvidenceId();
    let sha256 = input.sha256;

    if (!sha256) {
      if (input.rawContent) {
        sha256 = computeSha256(input.rawContent);
      } else {
        sha256 = computeSha256(input.uri);
      }
    }

    const evidence: EvidenceReference = {
      id,
      incidentId: input.incidentId,
      type: input.type,
      uri: input.uri,
      sha256,
      mimeType: input.mimeType,
      capturedAt: new Date().toISOString(),
      metadata: input.metadata || {},
    };

    this.evidenceStore.set(id, evidence);

    await globalEventBus.emit({
      type: "evidence.sealed",
      caseId: input.incidentId,
      incidentId: input.incidentId,
      source: "core:evidence",
      payload: { evidenceId: id, sha256, type: input.type },
    });

    return evidence;
  }

  getEvidence(id: string): EvidenceReference | null {
    return this.evidenceStore.get(id) || null;
  }

  getEvidenceByIncident(incidentId: string): EvidenceReference[] {
    return Array.from(this.evidenceStore.values()).filter((e) => e.incidentId === incidentId);
  }

  sealEvidenceCapsule(incidentId: string): EvidenceCapsule {
    const items = this.getEvidenceByIncident(incidentId);
    const hashes = items.map((i) => i.sha256);
    const hashDigest = computeEvidenceCapsuleDigest(hashes);

    const capsule: EvidenceCapsule = {
      incidentId,
      protocolVersion: PROTOCOL_VERSION,
      sealedAt: new Date().toISOString(),
      items,
      hashDigest,
    };

    this.capsules.set(incidentId, capsule);
    return capsule;
  }

  getCapsule(incidentId: string): EvidenceCapsule | null {
    return this.capsules.get(incidentId) || null;
  }

  clear(): void {
    this.evidenceStore.clear();
    this.capsules.clear();
  }
}

export const evidenceService = new EvidenceService();
