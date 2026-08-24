/**
 * Evidence Service for Raksha Core
 * Manages evidence ingestion, SHA-256 integrity verification, and persistent Evidence Capsule creation.
 */

import {
  CreateEvidenceInput,
  EvidenceCapsule,
  EvidenceReference,
} from "@raksha/schemas";
import {
  computeSha256,
  generateEvidenceId,
  globalEventBus,
} from "@raksha/shared";
import {
  IEvidenceRepository,
  defaultEvidenceRepository,
  IEventRepository,
  defaultEventRepository,
} from "./repositories/index.js";

export class EvidenceService {
  private evidenceRepo: IEvidenceRepository;
  private eventRepo: IEventRepository;

  constructor(
    evidenceRepo?: IEvidenceRepository,
    eventRepo?: IEventRepository
  ) {
    this.evidenceRepo = evidenceRepo || defaultEvidenceRepository;
    this.eventRepo = eventRepo || defaultEventRepository;
  }

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

    await this.evidenceRepo.create(evidence);

    const event = await globalEventBus.emit({
      type: "evidence.sealed",
      caseId: input.incidentId,
      incidentId: input.incidentId,
      source: "core:evidence",
      payload: { evidenceId: id, sha256, type: input.type },
    });

    await this.eventRepo.append(event);

    return evidence;
  }

  async getEvidence(id: string): Promise<EvidenceReference | null> {
    return this.evidenceRepo.findById(id);
  }

  async getEvidenceByIncident(incidentId: string): Promise<EvidenceReference[]> {
    return this.evidenceRepo.findByIncidentId(incidentId);
  }

  async sealEvidenceCapsule(incidentId: string): Promise<EvidenceCapsule> {
    return this.evidenceRepo.sealCapsule(incidentId);
  }

  async getCapsule(incidentId: string): Promise<EvidenceCapsule | null> {
    return this.evidenceRepo.getCapsule(incidentId);
  }

  async clear(): Promise<void> {
    await this.evidenceRepo.clear();
  }
}

export const evidenceService = new EvidenceService();
