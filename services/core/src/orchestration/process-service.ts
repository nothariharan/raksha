/**
 * Unified Process Orchestration Pipeline for Raksha Core
 * Connects Multimodal Extraction -> Cross-Source Reconciliation -> One-Question Clarification -> State Machine.
 */

import { FraudIncident, IncidentState, InputSource } from "@raksha/schemas";
import { normalizeMobile } from "@raksha/shared";
import { MultimodalExtractor, ExtractedFraudCandidate, ModalityType } from "../extraction/extractor.js";
import { ReconciliationEngine, ReconciliationResult } from "../reconciliation/reconciler.js";
import { ClarificationEngine, ClarificationDecision } from "../clarification/clarification-engine.js";
import { IncidentService, incidentService as defaultIncidentService } from "../incident-service.js";
import { EvidenceService, evidenceService as defaultEvidenceService } from "../evidence-service.js";

/**
 * States where the canonical incident is already complete enough that a channel
 * resume must NOT re-run initial extraction (avoids READY → QUESTION_PENDING demos).
 */
export const STABLE_RESUME_STATES: IncidentState[] = [
  "READY",
  "EVIDENCE_SEALED",
  "PACKET_READY",
  "HANDOFF_PENDING",
  "SUBMITTED",
  "ACKNOWLEDGED",
  "TRACKING",
];

export interface ProcessInput {
  incidentId?: string;
  source: InputSource;
  modality: ModalityType;
  content: string;
  language?: string;
  reporter?: {
    mobile?: string;
    name?: string;
  };
  userClarificationAnswer?: {
    field: string;
    answerValue: unknown;
  };
}

export interface ProcessOutput {
  incidentId: string;
  state: IncidentState;
  candidate: ExtractedFraudCandidate;
  reconciliation: ReconciliationResult;
  nextAction: ClarificationDecision;
  incident: FraudIncident;
}

export class ProcessService {
  private incidentService: IncidentService;
  private evidenceService: EvidenceService;
  private incidentCandidatesMap: Map<string, ExtractedFraudCandidate[]> = new Map();

  constructor(
    incidentService?: IncidentService,
    evidenceService?: EvidenceService
  ) {
    this.incidentService = incidentService || defaultIncidentService;
    this.evidenceService = evidenceService || defaultEvidenceService;
  }

  private candidateFromIncident(incident: FraudIncident): ExtractedFraudCandidate {
    return {
      narrative: incident.narrative?.text,
      amount: incident.transaction?.amount,
      currency: incident.transaction?.currency || "INR",
      channel: incident.transaction?.channel || "UPI",
      transactionId: incident.transaction?.transactionId || null,
      transactionDatetime: incident.transaction?.timestamp || null,
      debitInstitution: incident.transaction?.debitInstitution || null,
      beneficiaryIdentifier: incident.transaction?.beneficiaryIdentifier || null,
      beneficiaryInstitution: incident.transaction?.beneficiaryInstitution || null,
      confidence: { amount: 1, transactionId: 1 },
      sourceRefs: { resume: [`resume#${incident.id}`] },
      extractedAt: new Date().toISOString(),
    };
  }

  /**
   * After civic handoff, short "continue / status" utterances should resume the
   * same case. A clearly new fraud narrative still creates a fresh incident.
   */
  private isContinueIntent(content: string): boolean {
    const t = (content || "").trim().toLowerCase();
    if (!t) return true;
    if (
      /\b(continue|status|track|case|check status|meri report|apni report|continue my report)\b/i.test(
        t
      ) ||
      /मेरी रिपोर्ट|स्थिति|जारी/.test(content || "")
    ) {
      return true;
    }
    // Ultra-short non-fraud utterances after handoff (e.g. "ok", "haan")
    if (t.length <= 24 && !/\b(fraud|scam|utr|paid|rupee|₹|धोखा|फ्रॉड)\b/i.test(t)) {
      return true;
    }
    return false;
  }

  private resumeStableIncident(
    incident: FraudIncident,
    lang: string
  ): ProcessOutput {
    const candidate = this.candidateFromIncident(incident);
    const reconciliation = ReconciliationEngine.reconcile([candidate]);

    let nextAction: ClarificationDecision;
    if (
      incident.state === "READY" ||
      incident.state === "EVIDENCE_SEALED" ||
      incident.state === "PACKET_READY" ||
      incident.state === "HANDOFF_PENDING"
    ) {
      nextAction = ClarificationEngine.decideNextQuestion(reconciliation, lang);
      if (nextAction.nextActionType !== "READY_FOR_HANDOFF") {
        nextAction = {
          ...nextAction,
          type: "READY_FOR_HANDOFF",
          nextActionType: "READY_FOR_HANDOFF",
          isComplete: true,
          prompt:
            nextAction.prompt ||
            "Details are verified. You may confirm to submit the emergency freeze report.",
        };
      }
    } else {
      nextAction = {
        type: "NONE",
        nextActionType: "NONE",
        prompt:
          incident.state === "ACKNOWLEDGED"
            ? "Your report has been acknowledged by the simulated bank response layer."
            : "Your report has been submitted. Reply STATUS for tracking details.",
        localizedPrompts: {
          en: "Your report status is available. Reply STATUS for details.",
          hi: "आपकी रिपोर्ट की स्थिति उपलब्ध है। विवरण के लिए STATUS भेजें।",
          ta: "உங்கள் புகார் நிலை கிடைக்கும். விவரங்களுக்கு STATUS அனுப்பவும்.",
          te: "మీ నివేదిక స్థితి అందుబాటులో ఉంది.",
          kn: "ನಿಮ್ಮ ವರದಿ ಸ್ಥಿತಿ ಲಭ್ಯವಿದೆ.",
          bn: "আপনার রিপোর্টের অবস্থা পাওয়া যাবে।",
          mr: "तुमच्या अहवालाची स्थिती उपलब्ध आहे.",
        },
        isComplete: true,
      };
    }

    return {
      incidentId: incident.id,
      state: incident.state,
      candidate,
      reconciliation,
      nextAction,
      incident,
    };
  }

  async processInput(input: ProcessInput): Promise<ProcessOutput> {
    const lang = input.language || "en";
    let incident: FraudIncident;

    // 1. Load or Create Incident — mobile-first resolution
    //
    // Priority order:
    //   a) Explicit incidentId supplied → load & verify ownership
    //   b) reporter.mobile supplied → findOpenByMobile (resume) or createIncident (new)
    //   c) Neither → error (REPORTER_MOBILE_REQUIRED)
    if (input.incidentId) {
      const existing = await this.incidentService.getIncident(input.incidentId);
      if (!existing) {
        throw new Error(`Incident not found: ${input.incidentId}`);
      }
      // Ownership check: if the caller also provides a mobile it must match
      if (input.reporter?.mobile) {
        const callerNorm = normalizeMobile(input.reporter.mobile);
        const ownerNorm = existing.reporter.mobile
          ? normalizeMobile(existing.reporter.mobile)
          : null;
        if (ownerNorm && ownerNorm !== callerNorm) {
          throw new Error(
            `Incident ${input.incidentId} does not belong to mobile ${callerNorm}`
          );
        }
      }
      incident = existing;
    } else if (input.reporter?.mobile) {
      const normalized = normalizeMobile(input.reporter.mobile);
      const open = await this.incidentService.findOpenByMobile(normalized);
      if (open) {
        incident = open;
      } else {
        const latest = await this.incidentService.findLatestByMobile(normalized);
        if (
          latest &&
          (latest.state === "SUBMITTED" || latest.state === "ACKNOWLEDGED") &&
          this.isContinueIntent(input.content) &&
          !input.userClarificationAnswer
        ) {
          incident = latest;
        } else {
          incident = await this.incidentService.createIncident({
            source: input.source,
            narrative: { text: input.content },
            reporter: {
              mobile: normalized,
              name: input.reporter?.name,
              preferredLanguage: lang,
            },
          });
        }
      }
    } else {
      throw new Error("REPORTER_MOBILE_REQUIRED: supply reporter.mobile or incidentId");
    }

    // 1b. Stable resume — do not re-run extraction on READY / post-handoff states
    //     unless the citizen is answering a clarification (explicit field write).
    if (
      (STABLE_RESUME_STATES as string[]).includes(incident.state) &&
      !input.userClarificationAnswer
    ) {
      return this.resumeStableIncident(incident, lang);
    }

    // 2. Ingest Evidence if applicable
    if (input.modality === "image" || input.modality === "voice" || input.modality === "document") {
      await this.evidenceService.addEvidence({
        incidentId: incident.id,
        type: input.modality === "voice" ? "VOICE_STATEMENT" : "TRANSACTION_SCREENSHOT",
        uri: `synthetic://${input.modality}/${Date.now()}`,
        rawContent: input.content,
      });
    }

    // 3. Extract Candidate from this input
    const candidate = MultimodalExtractor.extractCandidate({
      modality: input.modality,
      content: input.content,
      language: lang,
      sourceId: `${input.modality}#${Date.now()}`,
    });

    const existingCandidates = this.incidentCandidatesMap.get(incident.id) || [];

    // 4. Handle direct user clarification / conflict resolution answer
    if (input.userClarificationAnswer) {
      const { field, answerValue } = input.userClarificationAnswer;
      if (field === "transaction.amount" || field === "amount") {
        candidate.amount = Number(answerValue);
        for (const ec of existingCandidates) {
          ec.amount = Number(answerValue);
        }
      } else if (field === "transaction.transactionId" || field === "transactionId") {
        candidate.transactionId = String(answerValue);
        for (const ec of existingCandidates) {
          ec.transactionId = String(answerValue);
        }
      } else if (field === "transaction.timestamp" || field === "timestamp") {
        candidate.transactionDatetime = String(answerValue);
        for (const ec of existingCandidates) {
          ec.transactionDatetime = String(answerValue);
        }
      }
    }

    // Append to incident candidate history
    existingCandidates.push(candidate);
    this.incidentCandidatesMap.set(incident.id, existingCandidates);

    // 5. Reconcile all candidates for this incident
    const reconciliation = ReconciliationEngine.reconcile(existingCandidates);
    const reconciled = reconciliation.reconciledCandidate;

    // 6. Update Incident Record with Reconciled Fields
    await this.incidentService.updateIncident(incident.id, {
      narrative: {
        text: reconciled.narrative || incident.narrative.text,
        source: input.source,
      },
      transaction: {
        amount: reconciled.amount,
        transactionId: reconciled.transactionId || undefined,
        timestamp: reconciled.transactionDatetime || undefined,
        debitInstitution: reconciled.debitInstitution || undefined,
        beneficiaryIdentifier: reconciled.beneficiaryIdentifier || undefined,
        beneficiaryInstitution: reconciled.beneficiaryInstitution || undefined,
        channel: reconciled.channel || "UPI",
      },
    });

    // 7. Decide Next Clarification Action
    const nextAction = ClarificationEngine.decideNextQuestion(reconciliation, lang);

    // 8. Transition State Machine
    let nextState: IncidentState = "INTAKE";
    if (nextAction.nextActionType === "CONFIRM_CONFLICT") {
      nextState = "USER_CONFIRMATION";
    } else if (nextAction.nextActionType === "ASK_USER") {
      nextState = "QUESTION_PENDING";
    } else if (nextAction.nextActionType === "READY_FOR_HANDOFF") {
      nextState = "READY";
      await this.evidenceService.sealEvidenceCapsule(incident.id);
    }

    const finalizedIncident = await this.incidentService.transitionState(incident.id, nextState);

    return {
      incidentId: incident.id,
      state: nextState,
      candidate,
      reconciliation,
      nextAction,
      incident: finalizedIncident,
    };
  }

  clear(): void {
    this.incidentCandidatesMap.clear();
  }
}

export const processService = new ProcessService();
