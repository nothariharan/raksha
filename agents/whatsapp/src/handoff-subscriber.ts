/**
 * WhatsApp handoff subscriber
 *
 * Listens for CAP incident.accepted and sends the citizen notification automatically.
 * No scripts/send-whatsapp.mjs in the happy path.
 */

import { CAPEvent, IncidentAcceptedEventPayload, FraudIncident } from "@raksha/schemas";
import { globalEventBus } from "@raksha/shared";
import { WhatsAppService, defaultWhatsAppService } from "./whatsapp-service.js";

let unsubscribe: (() => void) | null = null;
let wired = false;

export function wireWhatsAppHandoffSubscriber(service?: WhatsAppService): () => void {
  if (wired && unsubscribe) return unsubscribe;

  const ws = service || defaultWhatsAppService;

  unsubscribe = globalEventBus.subscribe<IncidentAcceptedEventPayload>(
    "incident.accepted",
    async (event: CAPEvent<IncidentAcceptedEventPayload>) => {
      const payload = event.payload;
      const incident = payload.incident as FraudIncident | undefined;
      const mobile = incident?.reporter?.mobile;
      if (!mobile || !payload.incidentId || !payload.externalReference) {
        console.warn(
          "[WhatsAppHandoff] Skipping notify — missing mobile or reference on incident.accepted"
        );
        return;
      }

      try {
        await ws.notifyCitizenIncidentAccepted({
          mobile,
          incidentId: payload.incidentId,
          referenceNumber: payload.externalReference,
          amount: incident?.transaction?.amount,
          channel: incident?.transaction?.channel,
          bank: incident?.transaction?.debitInstitution,
          utr: incident?.transaction?.transactionId,
        });
        console.log(
          `[WhatsAppHandoff] Notified ${mobile} for ${payload.incidentId} (${payload.externalReference})`
        );
      } catch (err) {
        console.error("[WhatsAppHandoff] Notify failed:", err);
      }
    }
  );

  wired = true;
  return unsubscribe;
}

export function unwireWhatsAppHandoffSubscriber(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    wired = false;
  }
}
