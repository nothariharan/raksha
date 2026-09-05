import { CAPActionResponse, ProcessResponse, FraudIncident } from "@raksha/schemas";
import { getTranslation } from "@raksha/i18n";
import { processService, incidentService } from "@raksha/core";
import { actionRouter } from "@raksha/cap";
import { normalizeMobile } from "@raksha/shared";

function isPublicHttpUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      !/^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function publicDeskUrls(): { portalA: string; portalB: string } {
  const origin = (process.env.PROTOCOL_PUBLIC_ORIGIN || "").replace(/\/$/, "");
  const envA = (process.env.PORTAL_A_BASE_URL || "").replace(/\/$/, "");
  const envB = (process.env.PORTAL_B_BASE_URL || "").replace(/\/$/, "");
  return {
    portalA: isPublicHttpUrl(envA)
      ? envA
      : isPublicHttpUrl(origin)
        ? `${origin}/portal-a`
        : "http://localhost:3003",
    portalB: isPublicHttpUrl(envB)
      ? envB
      : isPublicHttpUrl(origin)
        ? `${origin}/portal-b`
        : "http://localhost:3004",
  };
}

export interface PhoneToolsConfig {
  coreBaseUrl?: string;
  capBaseUrl?: string;
  /** Tests inject isolated Core so submit/status do not hit the process singleton DB. */
  incidentLookup?: (incidentId: string) => Promise<FraudIncident | null | undefined>;
  processInput?: (input: Parameters<typeof processService.processInput>[0]) => ReturnType<typeof processService.processInput>;
}

function looksLikeSpokenConfirmation(speech: string): boolean {
  const t = (speech || "").trim();
  if (!t) return false;
  return /^(yes|yep|yeah|haan|ha|haanji|confirm|confirmed|sahi|correct|theek hai|theek|ok confirm|हाँ|சரி)([.,!\s]|$)/i.test(
    t
  );
}

export class PhoneToolsHandler {
  private coreBaseUrl: string;
  private capBaseUrl: string;
  private incidentLookup?: PhoneToolsConfig["incidentLookup"];
  private processInputFn: NonNullable<PhoneToolsConfig["processInput"]>;

  constructor(config?: PhoneToolsConfig) {
    this.coreBaseUrl = config?.coreBaseUrl || process.env.CORE_BASE_URL || "http://localhost:3001";
    this.capBaseUrl = config?.capBaseUrl || process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
    this.incidentLookup = config?.incidentLookup;
    this.processInputFn = config?.processInput || ((input) => processService.processInput(input));
  }

  async startIncident(params: {
    narrative: string;
    callerPhone?: string;
    language?: string;
  }): Promise<{
    incidentId: string;
    state: string;
    promptForCaller: string;
    missingField?: string;
    isReady: boolean;
  }> {
    const lang = params.language || "hi";
    let data: ProcessResponse;

    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001") && !this.incidentLookup) {
        const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "phone",
            modality: "voice",
            content: params.narrative,
            language: lang,
            reporter: { mobile: params.callerPhone || "+919876543210" },
          }),
        });
        if (res.ok) {
          data = (await res.json()) as ProcessResponse;
        } else {
          const out = await this.processInputFn({
            source: "phone",
            modality: "voice",
            content: params.narrative,
            language: lang,
            reporter: { mobile: params.callerPhone || "+919876543210" },
          });
          data = {
            incidentId: out.incidentId,
            state: out.state,
            nextAction: out.nextAction,
            incident: out.incident,
          };
        }
      } else {
        const out = await this.processInputFn({
          source: "phone",
          modality: "voice",
          content: params.narrative,
          language: lang,
          reporter: { mobile: params.callerPhone || "+919876543210" },
        });
        data = {
          incidentId: out.incidentId,
          state: out.state,
          nextAction: out.nextAction,
          incident: out.incident,
        };
      }
    } catch {
      const out = await this.processInputFn({
        source: "phone",
        modality: "voice",
        content: params.narrative,
        language: lang,
        reporter: { mobile: params.callerPhone || "+919876543210" },
      });
      data = {
        incidentId: out.incidentId,
        state: out.state,
        nextAction: out.nextAction,
        incident: out.incident,
      };
    }
    const utr = String(data.incident.transaction.transactionId || "").replace(/\D/g, "");
    const hasSpokenProof = !!data.incident.transaction.amount && utr.length === 12;
    const isReady = data.state === "READY" && hasSpokenProof;
    let promptForCaller = data.nextAction.prompt || getTranslation(lang).askMissingUTR;

    if (data.state === "READY" && !hasSpokenProof) {
      promptForCaller =
        lang === "hi"
          ? "रिपोर्ट दर्ज करने से पहले बैंक SMS या रसीद से 12 अंकों का UTR बताइए।"
          : "I still need the 12-digit UTR from your bank SMS or receipt before I can file.";
    } else if (isReady) {
      const amt = data.incident.transaction.amount || 0;
      const bank = data.incident.transaction.debitInstitution || "State Bank of India";
      promptForCaller =
        lang === "hi"
          ? `मैंने ₹${amt.toLocaleString()} और ${bank} दर्ज कर लिया है। यूटीआर ${utr}। कृपया पुष्टि करें — क्या मैं इसे 1930 साइबर सेल और बैंक को भेज दूँ?`
          : `I have recorded ₹${amt.toLocaleString()} with ${bank}. UTR ${utr}. Please confirm these details are correct. Shall I send this to 1930 and the bank now?`;
    }

    return {
      incidentId: data.incidentId,
      state: data.state,
      promptForCaller,
      missingField: data.nextAction.field,
      isReady,
    };
  }

  async processUserInput(params: {
    incidentId?: string;
    userSpeech: string;
    isConfirmation?: boolean;
    confirmedField?: string;
    confirmedValue?: unknown;
    language?: string;
    callerPhone?: string;
  }): Promise<{
    incidentId: string;
    state: string;
    promptForCaller: string;
    missingField?: string;
    isReady: boolean;
  }> {
    const lang = params.language || "hi";
    let userClarificationAnswer: { field: string; answerValue: unknown } | undefined;

    if (params.confirmedField && params.confirmedValue !== undefined) {
      userClarificationAnswer = {
        field: params.confirmedField,
        answerValue: params.confirmedValue,
      };
    } else {
      const utrMatch = params.userSpeech.match(/\b([0-9]{12})\b/);
      if (utrMatch) {
        userClarificationAnswer = {
          field: "transaction.transactionId",
          answerValue: utrMatch[1],
        };
      }
    }

    const confirmFacts =
      (params.isConfirmation || looksLikeSpokenConfirmation(params.userSpeech)) &&
      !userClarificationAnswer;

    let data: ProcessResponse;
    const normalizedCaller = params.callerPhone ? normalizeMobile(params.callerPhone) : undefined;
    const processBody = {
      incidentId: params.incidentId || undefined,
      source: "phone" as const,
      modality: "voice" as const,
      content: params.userSpeech,
      language: lang,
      reporter: normalizedCaller ? { mobile: normalizedCaller } : undefined,
      userClarificationAnswer,
      confirmFacts: confirmFacts || undefined,
    };
    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001") && !this.incidentLookup) {
        const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processBody),
        });
        if (res.ok) {
          data = (await res.json()) as ProcessResponse;
        } else {
          const out = await this.processInputFn(processBody);
          data = {
            incidentId: out.incidentId,
            state: out.state,
            nextAction: out.nextAction,
            incident: out.incident,
          };
        }
      } else {
        const out = await this.processInputFn(processBody);
        data = {
          incidentId: out.incidentId,
          state: out.state,
          nextAction: out.nextAction,
          incident: out.incident,
        };
      }
    } catch {
      const out = await this.processInputFn(processBody);
      data = {
        incidentId: out.incidentId,
        state: out.state,
        nextAction: out.nextAction,
        incident: out.incident,
      };
    }

    const utr = String(data.incident.transaction.transactionId || "").replace(/\D/g, "");
    const hasSpokenProof = !!data.incident.transaction.amount && utr.length === 12;
    const isReady = data.state === "READY" && hasSpokenProof;
    let promptForCaller = data.nextAction.prompt || getTranslation(lang).askMissingUTR;

    if (data.state === "READY" && !hasSpokenProof) {
      promptForCaller =
        lang === "hi"
          ? "रिपोर्ट दर्ज करने से पहले बैंक SMS या रसीद से 12 अंकों का UTR बताइए।"
          : "I still need the 12-digit UTR from your bank SMS or receipt before I can file.";
    } else if (isReady) {
      const amt = data.incident.transaction.amount || 0;
      const bank = data.incident.transaction.debitInstitution || "the bank";
      promptForCaller =
        lang === "hi"
          ? `विवरण सत्यापित: ₹${amt.toLocaleString()}, ${bank}, यूटीआर ${utr}। कृपया पुष्टि करें — क्या मैं इसे 1930 और बैंक को भेज दूँ?`
          : `Details verified: ₹${amt.toLocaleString()}, ${bank}, UTR ${utr}. Please confirm — shall I submit this to 1930 and the bank now?`;
    }

    return {
      incidentId: data.incidentId,
      state: data.state,
      promptForCaller,
      missingField: data.nextAction.field,
      isReady,
    };
  }

  async submitIncident(params: { incidentId: string; language?: string }): Promise<{
    success: boolean;
    officialReference: string;
    caseId: string;
    confirmationSpeech: string;
    portalAUrl?: string;
    portalBUrl?: string;
  }> {
    const lang = params.language || "hi";
    let incident: FraudIncident | null = null;
    if (this.incidentLookup) {
      incident = (await this.incidentLookup(params.incidentId)) || null;
    } else {
      try {
        if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
          const incRes = await fetch(`${this.coreBaseUrl}/v1/incidents/${params.incidentId}`);
          if (incRes.ok) {
            const raw = (await incRes.json()) as any;
            incident = (raw.incident || raw) as FraudIncident;
          }
        }
      } catch {}

      if (!incident) {
        incident = (await incidentService.getIncident(params.incidentId)) as FraudIncident | null;
      }
    }
    if (!incident) throw new Error(`Incident ${params.incidentId} not found`);

    const utr = String(incident.transaction?.transactionId || "").replace(/\D/g, "");
    if (!incident.transaction?.amount || utr.length !== 12) {
      const ask =
        lang === "hi"
          ? "रिपोर्ट दर्ज करने से पहले बैंक SMS से 12 अंकों का UTR और राशि बताइए।"
          : "I cannot file yet. Please tell me the amount and the 12-digit UTR from your bank SMS.";
      return {
        success: false,
        officialReference: "",
        caseId: "",
        confirmationSpeech: ask,
      };
    }

    const idempotencyKey = `phone-cap-${params.incidentId}`;
    let capData: CAPActionResponse;

    try {
      if (this.capBaseUrl && !this.capBaseUrl.includes("localhost:3002")) {
        const capRes = await fetch(`${this.capBaseUrl}/cap/actions/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            action: "report_financial_fraud",
            payload: incident,
            idempotencyKey,
          }),
        });
        if (capRes.ok) {
          capData = (await capRes.json()) as CAPActionResponse;
        } else {
          capData = await actionRouter.executeAction("report_financial_fraud", incident, idempotencyKey);
        }
      } else {
        capData = await actionRouter.executeAction("report_financial_fraud", incident, idempotencyKey);
      }
    } catch {
      capData = await actionRouter.executeAction("report_financial_fraud", incident, idempotencyKey);
    }

    const refNum = capData.externalReference || `1930-SYN-${capData.caseId}`;
    const desks = publicDeskUrls();
    const portalA = desks.portalA;
    const portalB = desks.portalB;
    const bank = incident.transaction?.debitInstitution || "bank";

    const confirmationSpeech =
      lang === "hi"
        ? `आपकी रिपोर्ट दर्ज हो गई है। संदर्भ नंबर ${refNum} है। सिम्युलेटेड 1930 डेस्क ${portalA} और ${bank} फ्रीज डेस्क ${portalB} पर देख सकते हैं। अब यहाँ और कुछ करने की जरूरत नहीं है।`
        : `Your emergency fraud report is filed. Tracking reference ${refNum}. Open the simulated 1930 desk at ${portalA} and the ${bank} freeze desk at ${portalB}. Nothing else you need to do here.`;

    return {
      success: true,
      officialReference: refNum,
      caseId: capData.caseId,
      confirmationSpeech,
      portalAUrl: portalA,
      portalBUrl: portalB,
    };
  }

  async getIncidentStatus(params: { incidentId?: string; callerPhone?: string }) {
    if (params.incidentId && this.incidentLookup) {
      const incident = await this.incidentLookup(params.incidentId);
      if (!incident) return { error: "Incident not found" };
      return { incident };
    }
    if (params.incidentId) {
      try {
        if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
          const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${params.incidentId}`);
          if (res.ok) return await res.json();
        }
      } catch {}
      const incident = await incidentService.getIncident(params.incidentId);
      if (incident) return { incident };
    }
    if (params.callerPhone) {
      const mobile = normalizeMobile(params.callerPhone);
      const open = await incidentService.findOpenByMobile(mobile);
      const latest = open || (await incidentService.findLatestByMobile(mobile));
      if (latest) return { incident: latest };
    }
    return { error: "Incident not found" };
  }
}

export const defaultPhoneToolsHandler = new PhoneToolsHandler();
