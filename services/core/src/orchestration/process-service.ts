/**
 * Unified Process Orchestration Pipeline for Raksha Core
 * Connects Multimodal Extraction -> Cross-Source Reconciliation -> One-Question Clarification -> State Machine.
 */

import { FraudIncident, IncidentState, InputSource } from "@raksha/schemas";
import { normalizeMobile } from "@raksha/shared";
import { MultimodalExtractor, ExtractedFraudCandidate, ModalityType } from "../extraction/extractor.js";
import { VisionFireworksExtractor } from "../extraction/vision-fireworks.js";
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
  /** Citizen confirmed dossier facts; proof image still required before CAP. */
  confirmFacts?: boolean;
  /** Start a new incident even if this mobile already has an open READY case. */
  forceNew?: boolean;
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
      fraudCategory: incident.fraudCategory,
      amount: incident.transaction?.amount,
      currency: incident.transaction?.currency || "INR",
      channel: incident.transaction?.channel || "UPI",
      application: incident.transaction?.application,
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
  private looksLikeNewFraudNarrative(content: string): boolean {
    const t = (content || "").trim();
    if (t.length < 40) return false;
    return /\b(scam|scammed|fraud|paid|rupee|₹|utr|upi|phonepe|gpay|lost|cheated|धोखा|फ्रॉड|ठगी)\b/i.test(
      t
    );
  }

  /** READY leftovers from a prior demo must not swallow a new spoken report. */
  private shouldStartFreshIncident(incident: FraudIncident, input: ProcessInput): boolean {
    if (input.confirmFacts || input.userClarificationAnswer) return false;
    if (input.modality === "image" || input.modality === "document") return false;
    if (this.isContinueIntent(input.content)) return false;
    const parked =
      incident.state === "READY" ||
      incident.state === "EVIDENCE_SEALED" ||
      incident.state === "PACKET_READY" ||
      incident.state === "HANDOFF_PENDING";
    return parked && this.looksLikeNewFraudNarrative(input.content);
  }

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
      nextAction = ClarificationEngine.decideNextQuestion(reconciliation, lang, {
        fraudCategory: incident.fraudCategory,
        narrativeText: incident.narrative?.text,
        contextCaptured: !!incident.validation?.contextCaptured,
        factsConfirmed: !!incident.validation?.factsConfirmed,
        proofVerified: !!incident.validation?.proofVerified,
        hasScreenshotEvidence: (incident.evidence || []).length > 0,
      });
      // Only force handoff-ready once facts + proof are done (or already past proof gate).
      if (
        nextAction.nextActionType !== "READY_FOR_HANDOFF" &&
        nextAction.nextActionType !== "ASK_PROOF" &&
        incident.validation?.factsConfirmed &&
        incident.validation?.proofVerified
      ) {
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
    if (input.incidentId && !input.forceNew) {
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
      if (this.shouldStartFreshIncident(existing, input) && input.reporter?.mobile) {
        incident = await this.incidentService.createIncident({
          source: input.source,
          narrative: { text: input.content },
          reporter: {
            mobile: normalizeMobile(input.reporter.mobile),
            name: input.reporter?.name,
            preferredLanguage: lang,
          },
        });
      } else {
        incident = existing;
      }
    } else if (input.reporter?.mobile) {
      const normalized = normalizeMobile(input.reporter.mobile);
      const open = input.forceNew
        ? null
        : await this.incidentService.findOpenByMobile(normalized);
      if (open && !this.shouldStartFreshIncident(open, input)) {
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
    //     unless the citizen is answering a clarification, confirming facts, or uploading proof.
    if (input.confirmFacts && (incident.state === "READY" || incident.state === "USER_CONFIRMATION")) {
      await this.incidentService.updateIncident(incident.id, {
        validation: {
          ...incident.validation,
          factsConfirmed: true,
        },
      });
      incident = (await this.incidentService.getIncident(incident.id)) || incident;
      const candidate = this.candidateFromIncident(incident);
      const reconciliation = ReconciliationEngine.reconcile([candidate]);
      const nextAction = ClarificationEngine.decideNextQuestion(reconciliation, lang, {
        fraudCategory: incident.fraudCategory,
        narrativeText: incident.narrative?.text,
        contextCaptured: !!incident.validation?.contextCaptured,
        factsConfirmed: !!incident.validation?.factsConfirmed,
        proofVerified: !!incident.validation?.proofVerified,
        hasScreenshotEvidence: (incident.evidence || []).length > 0,
      });
      return {
        incidentId: incident.id,
        state: incident.state,
        candidate,
        reconciliation,
        nextAction,
        incident,
      };
    }

    if (
      (STABLE_RESUME_STATES as string[]).includes(incident.state) &&
      !input.userClarificationAnswer &&
      input.modality !== "image" &&
      input.modality !== "document"
    ) {
      return this.resumeStableIncident(incident, lang);
    }

    // 2. Ingest Evidence if applicable
    let visionWarning: string | undefined;
    if (input.modality === "image" || input.modality === "voice" || input.modality === "document") {
      await this.evidenceService.addEvidence({
        incidentId: incident.id,
        type: input.modality === "voice" ? "VOICE_STATEMENT" : "TRANSACTION_SCREENSHOT",
        uri: `synthetic://${input.modality}/${Date.now()}`,
        rawContent: input.content.length > 500 ? input.content.slice(0, 120) + "…" : input.content,
      });
    }

    // 3. Extract Candidate from this input
    let candidate: ExtractedFraudCandidate;
    if (input.modality === "image" || input.modality === "document") {
      const vision = await VisionFireworksExtractor.extract({
        modality: input.modality,
        content: input.content,
        language: lang,
        sourceId: `${input.modality}#${Date.now()}`,
      });
      candidate = vision.candidate;
      visionWarning = vision.warning;
      if (vision.readable || vision.source === "fireworks") {
        // Mark proof verified when vision (or heuristic) pulled payment fields from an image.
        if (vision.readable && (candidate.amount || candidate.transactionId)) {
          await this.incidentService.updateIncident(incident.id, {
            validation: {
              ...incident.validation,
              proofVerified: true,
            },
          });
          incident = (await this.incidentService.getIncident(incident.id)) || incident;
        }
      }
      // Demo fallback: if citizen already has amount+UTR and uploaded a screenshot, accept proof.
      if (
        !incident.validation?.proofVerified &&
        incident.validation?.factsConfirmed &&
        (incident.transaction?.amount || candidate.amount) &&
        (incident.transaction?.transactionId || candidate.transactionId)
      ) {
        await this.incidentService.updateIncident(incident.id, {
          validation: {
            ...incident.validation,
            proofVerified: true,
          },
        });
        incident = (await this.incidentService.getIncident(incident.id)) || incident;
      }
    } else {
      candidate = MultimodalExtractor.extractCandidate({
        modality: input.modality,
        content: input.content,
        language: lang,
        sourceId: `${input.modality}#${Date.now()}`,
      });
    }

    const existingCandidates = this.incidentCandidatesMap.get(incident.id) || [];

    // 4. Handle direct user clarification / conflict resolution answer
    let contextCaptured = !!incident.validation?.contextCaptured;
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
      } else if (field === "transaction.debitInstitution" || field === "debitInstitution") {
        candidate.debitInstitution = String(answerValue);
        for (const ec of existingCandidates) {
          ec.debitInstitution = String(answerValue);
        }
      } else if (field === "scam.context" || field === "narrative.context") {
        const extra = String(answerValue || "").trim();
        if (extra) {
          const mergedNarrative = [incident.narrative?.text, extra].filter(Boolean).join(" — ");
          candidate.narrative = mergedNarrative;
          contextCaptured = true;
        }
      }
    } else if ((input.content || "").trim().length >= 24) {
      // Free-form narrative that already carries scam context.
      contextCaptured = true;
    }

    // Append to incident candidate history
    existingCandidates.push(candidate);
    this.incidentCandidatesMap.set(incident.id, existingCandidates);

    // 5. Reconcile all candidates for this incident
    const reconciliation = ReconciliationEngine.reconcile(existingCandidates);
    const reconciled = reconciliation.reconciledCandidate;
    const fraudCategory = reconciled.fraudCategory || incident.fraudCategory || "OTHER";
    const spokenStory = (incident.narrative?.text || "").trim();
    const keepSpokenStory = input.modality === "image" && spokenStory.length >= 40;
    const scamSummary = keepSpokenStory
      ? incident.scamSummary || spokenStory.slice(0, 220)
      : (reconciled.narrative && reconciled.narrative.length <= 220
          ? reconciled.narrative
          : incident.scamSummary) || spokenStory.slice(0, 220);

    // 6. Update Incident Record with Reconciled Fields
    await this.incidentService.updateIncident(incident.id, {
      narrative: {
        text: keepSpokenStory ? spokenStory : reconciled.narrative || incident.narrative.text,
        source: input.source,
      },
      fraudCategory,
      scamSummary,
      transaction: {
        amount: reconciled.amount,
        transactionId: reconciled.transactionId || undefined,
        timestamp: reconciled.transactionDatetime || undefined,
        debitInstitution: reconciled.debitInstitution || undefined,
        beneficiaryIdentifier: reconciled.beneficiaryIdentifier || undefined,
        beneficiaryInstitution: reconciled.beneficiaryInstitution || undefined,
        channel: reconciled.channel || incident.transaction?.channel || "OTHER",
        application: reconciled.application || incident.transaction?.application,
      },
      validation: {
        ...incident.validation,
        contextCaptured,
        proofVerified: incident.validation?.proofVerified || false,
        factsConfirmed: incident.validation?.factsConfirmed || false,
        nextQuestion: undefined,
        missingFields: reconciliation.missingCrucialFields,
        conflicts: reconciliation.conflicts.map((c) => ({
          field: c.field,
          values: c.values,
          explanation: c.explanation,
        })),
      },
    });

    incident = (await this.incidentService.getIncident(incident.id)) || incident;

    // 7. Decide Next Clarification Action
    const nextAction = ClarificationEngine.decideNextQuestion(reconciliation, lang, {
      fraudCategory,
      narrativeText: incident.narrative?.text,
      contextCaptured: !!incident.validation?.contextCaptured,
      factsConfirmed: !!incident.validation?.factsConfirmed,
      proofVerified: !!incident.validation?.proofVerified,
      hasScreenshotEvidence: (incident.evidence || []).length > 0,
    });

    // 8. Transition State Machine
    let nextState: IncidentState = "INTAKE";
    if (nextAction.nextActionType === "CONFIRM_CONFLICT") {
      nextState = "USER_CONFIRMATION";
    } else if (nextAction.nextActionType === "ASK_USER" || nextAction.nextActionType === "ASK_PROOF") {
      nextState = "QUESTION_PENDING";
    } else if (nextAction.nextActionType === "READY_FOR_HANDOFF") {
      nextState = "READY";
      await this.evidenceService.sealEvidenceCapsule(incident.id);
    }

    const finalizedIncident = await this.incidentService.transitionState(incident.id, nextState);

    // Attach non-schema hint for UI (vision degraded)
    if (visionWarning && finalizedIncident.validation) {
      finalizedIncident.validation.nextQuestion =
        finalizedIncident.validation.nextQuestion ||
        (visionWarning === "vision_unavailable"
          ? "Screenshot received. Confirm amount and UTR if not shown yet."
          : undefined);
    }

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
