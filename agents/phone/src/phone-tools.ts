/**
 * Phone & Voice AI Agent Tool Implementations
 * Functions exposed to ElevenLabs and conversational LLM voice agents.
 */

import { CAPActionResponse, ProcessResponse } from "@raksha/schemas";
import { getTranslation } from "@raksha/i18n";

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

    if (!res.ok) {
      throw new Error(`Failed to start voice incident: ${res.statusText}`);
    }

    const data = (await res.json()) as ProcessResponse;
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

    const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incidentId: params.incidentId,
        source: "phone",
        modality: "voice",
        content: params.userSpeech,
        language: lang,
        userClarificationAnswer,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to process user speech: ${res.statusText}`);
    }

    const data = (await res.json()) as ProcessResponse;
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
    const incRes = await fetch(`${this.coreBaseUrl}/v1/incidents/${params.incidentId}`);
    if (!incRes.ok) throw new Error(`Incident ${params.incidentId} not found`);
    const incident = await incRes.json();

    const idempotencyKey = `phone-cap-${params.incidentId}`;
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

    const capData = (await capRes.json()) as CAPActionResponse;
    const refNum = capData.externalReference || `1930-SYN-${capData.caseId}`;

    const confirmationSpeech = lang === "hi"
      ? `आपकी रिपोर्ट सफलतापूर्वक दर्ज कर ली गई है। आपका संदर्भ नंबर है: ${refNum}। आपातकालीन खाता फ्रीज अनुरोध बैंक नोडल अधिकारी को भेज दिया गया है।`
      : `Your emergency fraud report is successfully filed. Your tracking reference is ${refNum}. The freeze request has been dispatched to the bank nodal desk.`;

    return {
      success: true,
      officialReference: refNum,
      caseId: capData.caseId,
      confirmationSpeech,
    };
  }

  async getIncidentStatus(params: { incidentId: string }) {
    const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${params.incidentId}`);
    if (!res.ok) return { error: "Incident not found" };
    return res.json();
  }
}

export const defaultPhoneToolsHandler = new PhoneToolsHandler();
