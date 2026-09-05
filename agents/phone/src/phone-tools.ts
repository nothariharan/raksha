import { CAPActionResponse, ProcessResponse, FraudIncident } from "@raksha/schemas";
import { getTranslation } from "@raksha/i18n";
import {
  processService,
  incidentService,
  buildCitizenCaseView,
  defaultEventRepository,
} from "@raksha/core";
import { actionRouter } from "@raksha/cap";
import { normalizeMobile } from "@raksha/shared";
import { detectSpokenLanguagePick, languagePickResult } from "./language-pick.js";

const CORE_FETCH_MS = 8_000;

async function fetchJsonOrNull<T>(url: string, init?: RequestInit): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CORE_FETCH_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

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
  findByMobile?: (mobile: string) => Promise<FraudIncident | null | undefined>;
  listEvents?: (incidentId: string) => Promise<import("@raksha/schemas").CAPEvent[]>;
  executeAction?: (
    action: string,
    payload: unknown,
    idempotencyKey: string
  ) => Promise<CAPActionResponse>;
  processInput?: (input: Parameters<typeof processService.processInput>[0]) => ReturnType<typeof processService.processInput>;
}

function looksLikeSpokenConfirmation(speech: string): boolean {
  const t = (speech || "").trim();
  if (!t) return false;
  return /^(yes|yep|yeah|haan|ha|haanji|confirm|confirmed|sahi|correct|theek hai|theek|ok confirm|हाँ|சரி)([.,!\s]|$)/i.test(
    t
  );
}

function digitRuns(speech: string): string[] {
  return (speech || "").match(/\d{8,}/g) || [];
}

function incompleteUtrPrompt(speech: string, lang: string): string | null {
  const runs = digitRuns(speech);
  if (runs.some((run) => run.length === 12)) return null;
  const short = runs.find((run) => run.length >= 8 && run.length !== 12);
  if (!short) return null;
  return lang === "hi"
    ? `मैंने ${short.length} अंक सुने। बैंक SMS से पूरे 12 अंकों का UTR पढ़िए।`
    : `I heard ${short.length} digits. I need the full 12-digit UTR from your bank SMS. Please read all twelve digits.`;
}

function filedClosingSpeech(lang: string, refNum: string): string {
  if (lang === "hi") {
    return `आपके समय के लिए धन्यवाद। रिपोर्ट दर्ज हो गई है। आधिकारिक साइबर क्राइम पोर्टल पर रिपोर्ट नंबर ${refNum} से देख सकते हैं। बाद में स्टेटस चाहिए हो या इसे आगे बढ़ाना हो, रक्षा को स्टेटस कहकर बताइए।`;
  }
  if (lang === "ta") {
    return `உங்கள் நேரத்திற்கு நன்றி. புகார் பதிவு செய்யப்பட்டது. அதிகாரப்பூர்வ சைபர் கிரைம் போர்ட்டலில் அறிக்கை எண் ${refNum} மூலம் பார்க்கலாம். நிலை தெரிய வேண்டும் அல்லது மேலும் நடவடிக்கை எடுக்க வேண்டும் என்றால் பின்னர் status என்று சொல்லுங்கள்.`;
  }
  return `Thank you for your time. The report is filed. You can find it on the official cyber crime portal under report number ${refNum}. If you want the status of this report later, or need to escalate it, contact Raksha and say status.`;
}

export class PhoneToolsHandler {
  private coreBaseUrl: string;
  private capBaseUrl: string;
  private incidentLookup?: PhoneToolsConfig["incidentLookup"];
  private findByMobileFn?: PhoneToolsConfig["findByMobile"];
  private listEventsFn?: PhoneToolsConfig["listEvents"];
  private executeActionFn?: PhoneToolsConfig["executeAction"];
  private processInputFn: NonNullable<PhoneToolsConfig["processInput"]>;

  constructor(config?: PhoneToolsConfig) {
    this.coreBaseUrl = config?.coreBaseUrl || process.env.CORE_BASE_URL || "http://localhost:3001";
    this.capBaseUrl = config?.capBaseUrl || process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
    this.incidentLookup = config?.incidentLookup;
    this.findByMobileFn = config?.findByMobile;
    this.listEventsFn = config?.listEvents;
    this.executeActionFn = config?.executeAction;
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
    const picked = detectSpokenLanguagePick(params.narrative);
    if (picked) return languagePickResult(picked);
    const lang = params.language || picked || "en";
    let data: ProcessResponse;

    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001") && !this.incidentLookup) {
        const remote = await fetchJsonOrNull<ProcessResponse>(`${this.coreBaseUrl}/v1/process`, {
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
        if (remote) {
          data = remote;
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
    const shortUtr = incompleteUtrPrompt(params.narrative, lang);

    if (shortUtr && !hasSpokenProof) {
      promptForCaller = shortUtr;
    } else if (data.state === "READY" && !hasSpokenProof) {
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
    const picked = detectSpokenLanguagePick(params.userSpeech);
    if (picked) return languagePickResult(picked);
    const lang = params.language || "en";
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
        const remote = await fetchJsonOrNull<ProcessResponse>(`${this.coreBaseUrl}/v1/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(processBody),
        });
        if (remote) {
          data = remote;
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
    const shortUtr = incompleteUtrPrompt(params.userSpeech, lang);

    if (shortUtr && !hasSpokenProof) {
      promptForCaller = shortUtr;
    } else if (data.state === "READY" && !hasSpokenProof) {
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
    const lang = params.language || "en";
    let incident: FraudIncident | null = null;
    if (this.incidentLookup) {
      incident = (await this.incidentLookup(params.incidentId)) || null;
    } else {
      try {
        if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
          const raw = await fetchJsonOrNull<{ incident?: FraudIncident } & FraudIncident>(
            `${this.coreBaseUrl}/v1/incidents/${params.incidentId}`
          );
          if (raw) incident = (raw.incident || raw) as FraudIncident;
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

    return {
      success: true,
      officialReference: refNum,
      caseId: capData.caseId,
      confirmationSpeech: filedClosingSpeech(lang, refNum),
      portalAUrl: portalA,
      portalBUrl: portalB,
    };
  }

  async getIncidentStatus(params: {
    incidentId?: string;
    callerPhone?: string;
    language?: string;
  }) {
    let incident: FraudIncident | null = null;
    if (params.incidentId && this.incidentLookup) {
      incident = (await this.incidentLookup(params.incidentId)) || null;
    } else if (params.incidentId) {
      try {
        if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
          const remote = await fetchJsonOrNull<{ incident?: FraudIncident } & FraudIncident>(
            `${this.coreBaseUrl}/v1/incidents/${params.incidentId}`
          );
          if (remote) incident = (remote.incident || remote) as FraudIncident;
        }
      } catch {}
      if (!incident) {
        incident = (await incidentService.getIncident(params.incidentId)) as FraudIncident | null;
      }
    } else if (params.callerPhone) {
      const mobile = normalizeMobile(params.callerPhone);
      if (this.findByMobileFn) {
        incident = (await this.findByMobileFn(mobile)) || null;
      } else {
        const open = await incidentService.findOpenByMobile(mobile);
        incident = open || (await incidentService.findLatestByMobile(mobile));
      }
    }
    if (!incident) return { error: "Incident not found" };

    let events: Awaited<ReturnType<typeof defaultEventRepository.findByIncidentId>> = [];
    try {
      if (this.listEventsFn) {
        events = await this.listEventsFn(incident.id);
      } else if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001") && !this.incidentLookup) {
        const remote = await fetchJsonOrNull<{ events?: typeof events }>(
          `${this.coreBaseUrl}/v1/incidents/${incident.id}/events`
        );
        events = remote?.events || [];
      } else {
        events = await defaultEventRepository.findByIncidentId(incident.id);
      }
    } catch {
      events = [];
    }

    const view = buildCitizenCaseView({
      incident,
      events,
      language: params.language || incident.reporter?.preferredLanguage || "en",
    });
    return { incident, view, speech: view.spokenStatus };
  }

  async followUpCase(params: {
    incidentId?: string;
    callerPhone?: string;
    language?: string;
    authorizedByCitizen?: boolean;
  }): Promise<{
    success: boolean;
    officialReference: string;
    confirmationSpeech: string;
    incidentId?: string;
  }> {
    const lang = params.language || "en";
    if (params.authorizedByCitizen === false) {
      return {
        success: false,
        officialReference: "",
        confirmationSpeech:
          "I will not follow up unless you explicitly say yes.",
      };
    }

    let incidentId = params.incidentId || "";
    if (!incidentId && params.callerPhone) {
      const status = await this.getIncidentStatus({
        callerPhone: params.callerPhone,
        language: lang,
      });
      incidentId = String((status as { incident?: { id?: string } }).incident?.id || "");
    }
    if (!incidentId) {
      return {
        success: false,
        officialReference: "",
        confirmationSpeech:
          "I do not have a filed report on this number yet. Please tell me what happened first.",
      };
    }

    const idempotencyKey = `follow-up-${incidentId}`;
    const payload = {
      incidentId,
      authorizedByCitizen: true,
      note: "Citizen follow-up via phone",
    };
    let capData: CAPActionResponse;
    try {
      if (this.executeActionFn) {
        capData = await this.executeActionFn("follow_up_case", payload, idempotencyKey);
      } else if (this.capBaseUrl && !this.capBaseUrl.includes("localhost:3002")) {
        const capRes = await fetch(`${this.capBaseUrl}/cap/actions/execute`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            action: "follow_up_case",
            payload,
            idempotencyKey,
          }),
        });
        if (capRes.ok) {
          capData = (await capRes.json()) as CAPActionResponse;
        } else {
          capData = await actionRouter.executeAction("follow_up_case", payload, idempotencyKey);
        }
      } else {
        capData = await actionRouter.executeAction("follow_up_case", payload, idempotencyKey);
      }
    } catch {
      capData = this.executeActionFn
        ? await this.executeActionFn("follow_up_case", payload, idempotencyKey)
        : await actionRouter.executeAction("follow_up_case", payload, idempotencyKey);
    }

    if (!capData.success) {
      return {
        success: false,
        officialReference: "",
        confirmationSpeech:
          capData.error ||
          "I could not record a follow-up yet. Please try again after checking status.",
        incidentId,
      };
    }

    const ref = capData.externalReference || "";
    const confirmationSpeech =
      lang === "hi"
        ? `फॉलो अप दर्ज हो गया है। केस ${incidentId}${ref ? ` संदर्भ ${ref}` : ""} सक्रिय रहता है।`
        : `Follow-up received. Your case ${incidentId}${ref ? ` (${ref})` : ""} remains active.`;

    return {
      success: true,
      officialReference: ref,
      confirmationSpeech,
      incidentId,
    };
  }
}

export const defaultPhoneToolsHandler = new PhoneToolsHandler();
