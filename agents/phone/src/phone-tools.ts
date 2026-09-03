import { CAPActionResponse, ProcessResponse, FraudIncident } from "@raksha/schemas";
import { getTranslation } from "@raksha/i18n";
import { processService, incidentService } from "@raksha/core";
import { actionRouter } from "@raksha/cap";
import { normalizeMobile } from "@raksha/shared";

export interface PhoneToolsConfig {
  coreBaseUrl?: string;
  capBaseUrl?: string;
}

export class PhoneToolsHandler {
  private coreBaseUrl: string;
  private capBaseUrl: string;

  constructor(config?: PhoneToolsConfig) {
    this.coreBaseUrl = config?.coreBaseUrl || process.env.CORE_BASE_URL || "http://localhost:3001";
    this.capBaseUrl = config?.capBaseUrl || process.env.CAP_PUBLIC_BASE_URL || "http://localhost:3002";
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
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
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
          const out = await processService.processInput({
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
        const out = await processService.processInput({
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
      const out = await processService.processInput({
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
    const isReady = data.state === "READY";
    let promptForCaller = data.nextAction.prompt || getTranslation(lang).askMissingUTR;

    if (isReady) {
      const amt = data.incident.transaction.amount || 0;
      const bank = data.incident.transaction.debitInstitution || "State Bank of India";
      promptForCaller = lang === "hi"
        ? `मैंने ₹${amt.toLocaleString()} का लेन-देन और ${bank} बैंक विवरण दर्ज कर लिया है। क्या आप चाहते हैं कि मैं इसे 1930 साइबर सेल को तुरंत भेज दूँ?`
        : `I have identified the ₹${amt.toLocaleString()} transaction from ${bank}. Should I submit the emergency freeze report now?`;
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
    incidentId: string;
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

    let data: ProcessResponse;
    const normalizedCaller = params.callerPhone ? normalizeMobile(params.callerPhone) : undefined;
    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
        const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incidentId: params.incidentId || undefined,
            source: "phone",
            modality: "voice",
            content: params.userSpeech,
            language: lang,
            reporter: normalizedCaller ? { mobile: normalizedCaller } : undefined,
            userClarificationAnswer,
          }),
        });
        if (res.ok) {
          data = (await res.json()) as ProcessResponse;
        } else {
          const out = await processService.processInput({
            incidentId: params.incidentId || undefined,
            source: "phone",
            modality: "voice",
            content: params.userSpeech,
            language: lang,
            reporter: normalizedCaller ? { mobile: normalizedCaller } : undefined,
            userClarificationAnswer,
          });
          data = {
            incidentId: out.incidentId,
            state: out.state,
            nextAction: out.nextAction,
            incident: out.incident,
          };
        }
      } else {
        const out = await processService.processInput({
          incidentId: params.incidentId || undefined,
          source: "phone",
          modality: "voice",
          content: params.userSpeech,
          language: lang,
          reporter: normalizedCaller ? { mobile: normalizedCaller } : undefined,
          userClarificationAnswer,
        });
        data = {
          incidentId: out.incidentId,
          state: out.state,
          nextAction: out.nextAction,
          incident: out.incident,
        };
      }
    } catch {
      const out = await processService.processInput({
        incidentId: params.incidentId || undefined,
        source: "phone",
        modality: "voice",
        content: params.userSpeech,
        language: lang,
        reporter: normalizedCaller ? { mobile: normalizedCaller } : undefined,
        userClarificationAnswer,
      });
      data = {
        incidentId: out.incidentId,
        state: out.state,
        nextAction: out.nextAction,
        incident: out.incident,
      };
    }

    const isReady = data.state === "READY";
    let promptForCaller = data.nextAction.prompt || getTranslation(lang).askMissingUTR;

    if (isReady) {
      const amt = data.incident.transaction.amount || 0;
      const utr = data.incident.transaction.transactionId || "Verified";
      promptForCaller = lang === "hi"
        ? `विवरण सत्यापित हो गया है: ₹${amt.toLocaleString()}, यूटीआर ${utr}। क्या मैं इसे अभी 1930 पोर्टल पर सबमिट करूँ?`
        : `Details verified: ₹${amt.toLocaleString()}, UTR ${utr}. May I submit this emergency freeze to the 1930 portal now?`;
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
  }> {
    const lang = params.language || "hi";
    let incident: FraudIncident | null = null;
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
    if (!incident) throw new Error(`Incident ${params.incidentId} not found`);

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

    const confirmationSpeech = lang === "hi"
      ? `आपकी रिपोर्ट दर्ज हो गई है। आपका संदर्भ नंबर है: ${refNum}। संबंधित प्रतिक्रिया प्रक्रिया के लिए अनुरोध भेजा गया है (सिम्युलेटेड प्रदर्शन)।`
      : `Your emergency fraud report is filed. Your tracking reference is ${refNum}. Emergency response processing request dispatched (Simulated Demonstration).`;

    return {
      success: true,
      officialReference: refNum,
      caseId: capData.caseId,
      confirmationSpeech,
    };
  }

  async getIncidentStatus(params: { incidentId: string }) {
    try {
      if (this.coreBaseUrl && !this.coreBaseUrl.includes("localhost:3001")) {
        const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${params.incidentId}`);
        if (res.ok) return await res.json();
      }
    } catch {}

    const incident = await incidentService.getIncident(params.incidentId);
    if (!incident) return { error: "Incident not found" };
    return { incident };
  }
}

export const defaultPhoneToolsHandler = new PhoneToolsHandler();
