import { CAPEvent, CAPEventType } from "@raksha/schemas";
import { generateEventId } from "./id-generator.js";

export type EventHandler<T = unknown> = (event: CAPEvent<T>) => void | Promise<void>;

export class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();
  private eventLog: CAPEvent[] = [];

  subscribe<T = unknown>(eventType: CAPEventType | string, handler: EventHandler<T>): () => void {
    const handlers = this.listeners.get(eventType) || [];
    handlers.push(handler as EventHandler);
    this.listeners.set(eventType, handlers);

    return () => {
      const current = this.listeners.get(eventType) || [];
      this.listeners.set(
        eventType,
        current.filter((h) => h !== handler)
      );
    };
  }

  async emit<T = unknown>(params: {
    type: CAPEventType | string;
    caseId: string;
    incidentId?: string;
    source: string;
    payload: T;
  }): Promise<CAPEvent<T>> {
    const event: CAPEvent<T> = {
      id: generateEventId(),
      type: params.type,
      caseId: params.caseId,
      incidentId: params.incidentId,
      source: params.source,
      timestamp: new Date().toISOString(),
      payload: params.payload,
    };

    this.eventLog.push(event as CAPEvent);

    const handlers = this.listeners.get(params.type) || [];
    const wildcardHandlers = this.listeners.get("*") || [];

    for (const handler of [...handlers, ...wildcardHandlers]) {
      try {
        await handler(event as CAPEvent);
      } catch (err) {
        console.error(`[EventBus] Error in handler for ${params.type}:`, err);
      }
    }

    return event;
  }

  getEvents(filter?: { caseId?: string; incidentId?: string; type?: string }): CAPEvent[] {
    return this.eventLog.filter((e) => {
      if (filter?.caseId && e.caseId !== filter.caseId) return false;
      if (filter?.incidentId && e.incidentId !== filter.incidentId) return false;
      if (filter?.type && e.type !== filter.type) return false;
      return true;
    });
  }

  clear(): void {
    this.listeners.clear();
    this.eventLog = [];
  }
}

// Global shared singleton for in-memory / local dev
export const globalEventBus = new EventBus();
