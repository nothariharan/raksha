/**
 * Raksha Web UI Client State Machine
 * Consumes the frozen /v1/process and CAP contracts with zero local business logic.
 */

import {
  FraudIncident,
  IncidentState,
  ProcessResponse,
  NextAction,
  CAPActionResponse,
  CAPEvent,
} from "@raksha/schemas";
import { SupportedLanguage } from "@raksha/i18n";

export type UIState =
  | "IDLE"
  | "LISTENING"
  | "PROCESSING"
  | "QUESTION"
  | "CONFLICT"
  | "READY"
  | "SUBMITTING"
  | "SUBMITTED"
  | "TRACKING";

export interface WebSessionState {
  uiState: UIState;
  incidentId: string | null;
  incident: FraudIncident | null;
  nextAction: NextAction | null;
  preferredLanguage: SupportedLanguage;
  developerMode: boolean;
  capResponse: CAPActionResponse | null;
  events: CAPEvent[];
  error: string | null;
}

export class RakshaWebClient {
  private state: WebSessionState;
  private coreBaseUrl: string;
  private capBaseUrl: string;
  private listeners: Array<(state: WebSessionState) => void> = [];

  constructor(config?: { coreBaseUrl?: string; capBaseUrl?: string; language?: SupportedLanguage }) {
    this.coreBaseUrl = config?.coreBaseUrl || "http://localhost:3001";
    this.capBaseUrl = config?.capBaseUrl || "http://localhost:3002";
    this.state = {
      uiState: "IDLE",
      incidentId: null,
      incident: null,
      nextAction: null,
      preferredLanguage: config?.language || "en",
      developerMode: false,
      capResponse: null,
      events: [],
      error: null,
    };
  }

  getState(): WebSessionState {
    return { ...this.state };
  }

  subscribe(listener: (state: WebSessionState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const current = this.getState();
    for (const listener of this.listeners) {
      listener(current);
    }
  }

  setLanguage(lang: SupportedLanguage): void {
    this.state.preferredLanguage = lang;
    this.notify();
  }

  toggleDeveloperMode(): void {
    this.state.developerMode = !this.state.developerMode;
    this.notify();
  }

  async submitInput(params: {
    modality: "text" | "image" | "voice" | "document" | "sms";
    content: string;
    userClarificationAnswer?: { field: string; answerValue: unknown };
  }): Promise<ProcessResponse> {
    this.state.uiState = "PROCESSING";
    this.state.error = null;
    this.notify();

    try {
      const res = await fetch(`${this.coreBaseUrl}/v1/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: this.state.incidentId || undefined,
          source: "web",
          modality: params.modality,
          content: params.content,
          language: this.state.preferredLanguage,
          userClarificationAnswer: params.userClarificationAnswer,
        }),
      });

      if (!res.ok) {
        throw new Error(`Process API failed with status ${res.status}`);
      }

      const data = (await res.json()) as ProcessResponse;

      this.state.incidentId = data.incidentId;
      this.state.incident = data.incident;
      this.state.nextAction = data.nextAction;

      const nextType = data.nextAction?.type || (data.nextAction as { nextActionType?: string })?.nextActionType;
      if (nextType === "CONFIRM" || nextType === "CONFIRM_CONFLICT" || data.state === "USER_CONFIRMATION") {
        this.state.uiState = "CONFLICT";
      } else if (nextType === "ASK_USER" || data.state === "QUESTION_PENDING") {
        this.state.uiState = "QUESTION";
      } else if (data.state === "READY" || nextType === "READY_FOR_HANDOFF" || nextType === "SUBMIT") {
        this.state.uiState = "READY";
      } else if (data.state === "SUBMITTED" || data.state === "ACKNOWLEDGED") {
        this.state.uiState = "SUBMITTED";
      } else {
        this.state.uiState = "IDLE";
      }

      await this.refreshEvents();
      this.notify();
      return data;
    } catch (err) {
      this.state.error = (err as Error).message;
      this.state.uiState = "IDLE";
      this.notify();
      throw err;
    }
  }

  async submitToCAP(): Promise<CAPActionResponse> {
    if (!this.state.incident) {
      throw new Error("No incident to submit to CAP");
    }

    this.state.uiState = "SUBMITTING";
    this.notify();

    try {
      const idempotencyKey = `web-submit-${this.state.incident.id}`;
      const res = await fetch(`${this.capBaseUrl}/cap/actions/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          action: "report_financial_fraud",
          payload: this.state.incident,
          idempotencyKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`CAP execution failed with status ${res.status}`);
      }

      const capResult = (await res.json()) as CAPActionResponse;
      this.state.capResponse = capResult;
      this.state.uiState = "SUBMITTED";

      await this.refreshEvents();
      this.notify();
      return capResult;
    } catch (err) {
      this.state.error = (err as Error).message;
      this.state.uiState = "READY";
      this.notify();
      throw err;
    }
  }

  async refreshEvents(): Promise<CAPEvent[]> {
    if (!this.state.incidentId) return [];
    try {
      const res = await fetch(`${this.coreBaseUrl}/v1/incidents/${this.state.incidentId}/events`);
      if (res.ok) {
        const data = (await res.json()) as { events: CAPEvent[] };
        this.state.events = data.events || [];
        this.notify();
        return this.state.events;
      }
    } catch {
      // Ignore background refresh errors
    }
    return [];
  }

  reset(): void {
    this.state = {
      uiState: "IDLE",
      incidentId: null,
      incident: null,
      nextAction: null,
      preferredLanguage: this.state.preferredLanguage,
      developerMode: this.state.developerMode,
      capResponse: null,
      events: [],
      error: null,
    };
    this.notify();
  }
}
