import { getTranslation, SupportedLanguage } from "@raksha/i18n";
import { FraudIncident, NextAction } from "@raksha/schemas";
import { LANGUAGE_PICKER_TEXT } from "./language.js";
import { ConflictOption } from "./conversation-store.js";

function money(amount?: number | null): string {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function dash(value?: string | null): string {
  return value && String(value).trim() ? String(value) : "—";
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

/** Live Render desks when PROTOCOL_PUBLIC_ORIGIN is set; localhost only for local demo. */
export function resolveDeskUrls(): { portalA: string; portalB: string } {
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

function deskLines(portalA: string, portalB: string, bank: string): string {
  return (
    `Open desks (simulated):\n` +
    `• 1930 cyber cell (report filed): ${portalA}\n` +
    `• ${bank} freeze desk: ${portalB}`
  );
}

export function formatLanguagePicker(): string {
  return LANGUAGE_PICKER_TEXT;
}

export function formatAskNarrative(lang: SupportedLanguage): string {
  const t = getTranslation(lang);
  return `${t.languageAcknowledged}\n\n${t.askNarrative}`;
}

export function formatQuestion(lang: SupportedLanguage, prompt?: string): string {
  const t = getTranslation(lang);
  return `📋 ${prompt || t.askMissingUTR}`;
}

export function formatConflict(
  lang: SupportedLanguage,
  prompt: string | undefined,
  options: ConflictOption[]
): string {
  const t = getTranslation(lang);
  const lines = options.map((opt, i) => `${i + 1}️⃣ ${opt.label}`);
  return (
    `⚠️ *${t.askConflictResolution}*\n\n` +
    `${prompt || t.askConflictResolution}\n\n` +
    (lines.length ? `Reply with the correct number:\n${lines.join("\n")}` : t.askConflictResolution)
  );
}

export function formatReady(lang: SupportedLanguage, incident: FraudIncident): string {
  const t = getTranslation(lang);
  return (
    `✅ *${t.reportReady}*\n\n` +
    `Please confirm these details are correct:\n` +
    `• Amount: *${money(incident.transaction?.amount)}*\n` +
    `• Mode: *${dash(incident.transaction?.channel)}*\n` +
    `• Bank: *${dash(incident.transaction?.debitInstitution)}*\n` +
    `• UTR: *${dash(incident.transaction?.transactionId)}*\n` +
    (incident.narrative?.text ? `• What happened: ${String(incident.narrative.text).slice(0, 160)}\n` : "") +
    `\nReply *YES* to dispatch the emergency freeze to 1930 and the bank.`
  );
}

export function formatAccepted(
  lang: SupportedLanguage,
  incident: FraudIncident,
  refNumber: string,
  portalA: string,
  portalB: string
): string {
  const t = getTranslation(lang);
  const bank = incident.transaction?.debitInstitution || "your bank";
  return (
    `🛡️ *${t.reportAccepted}*\n\n` +
    `Tracking Reference: *${refNumber}*\n` +
    `Incident ID: *${incident.id}*\n\n` +
    `• Amount: *${money(incident.transaction?.amount)}*\n` +
    `• Mode: *${dash(incident.transaction?.channel)}*\n` +
    `• Bank: *${bank}*\n` +
    `• UTR: *${dash(incident.transaction?.transactionId)}*\n\n` +
    `${t.reportSubmitted}\n\n` +
    `${deskLines(portalA, portalB, bank)}\n\n` +
    `Nothing else you need to do here.\n` +
    `Reply *STATUS* anytime for an update.`
  );
}

export function formatStatus(lang: SupportedLanguage, incident: FraudIncident): string {
  const handoffRef = incident.handoff?.externalReference;
  const handoffStatus = incident.handoff?.status;
  const bank = incident.transaction?.debitInstitution || "your bank";
  const desks = resolveDeskUrls();
  const institutional = handoffRef
    ? `\n• Tracking Ref: *${handoffRef}*\n• Institutional: *${handoffStatus || "SUBMITTED"}*`
    : "";
  const filedDesks = handoffRef ? `\n\n${deskLines(desks.portalA, desks.portalB, bank)}` : "";
  return (
    `🛡️ *Raksha Case Status*\n\n` +
    `Case ID: *${incident.id}*\n` +
    `Status: *${incident.state}*\n` +
    `• Amount: *${money(incident.transaction?.amount)}*\n` +
    `• Channel: *${dash(incident.transaction?.channel)}*\n` +
    `• Bank: *${dash(bank)}*\n` +
    `• UTR: *${dash(incident.transaction?.transactionId)}*${institutional}${filedDesks}\n\n` +
    `Your emergency fraud report is active in the Civic Action Protocol.\n` +
    `_Simulated downstream service — 1930 / bank response for prototype_`
  );
}

export function formatFollowUpAccepted(
  lang: SupportedLanguage,
  incidentId: string,
  reference?: string
): string {
  const ref = reference ? `\nTracking Reference: *${reference}*` : "";
  if (lang === "hi") {
    return (
      `🛡️ *फॉलो अप दर्ज*\n\n` +
      `केस *${incidentId}*${ref}\n` +
      `नागरिक फॉलो अप प्राप्त हुआ। आपका केस सक्रिय रहता है।\n\n` +
      `_Simulated downstream service — 1930 / bank response for prototype_`
    );
  }
  return (
    `🛡️ *Follow-up received*\n\n` +
    `Case *${incidentId}*${ref}\n` +
    `Follow-up received.\nYour case remains active.\n\n` +
    `_Simulated downstream service — 1930 / bank response for prototype_`
  );
}

export function formatNoCase(lang: SupportedLanguage): string {
  return getTranslation(lang).noActiveCase;
}

export function formatNotifyAccepted(
  lang: SupportedLanguage,
  params: {
    incidentId: string;
    referenceNumber: string;
    amount?: number;
    channel?: string;
    bank?: string;
    utr?: string;
    portalA: string;
    portalB: string;
  }
): string {
  const t = getTranslation(lang);
  const bank = params.bank || "your bank";
  return (
    `🛡️ *${t.reportAccepted}*\n\n` +
    `Dear Citizen,\n${t.reportSubmitted}\n\n` +
    `• Tracking Reference: *${params.referenceNumber}*\n` +
    `• Case ID: *${params.incidentId}*\n` +
    `• Amount: *${money(params.amount)}*\n` +
    `• Channel: *${dash(params.channel)}*\n` +
    `• Bank: *${bank}*\n` +
    `• UTR: *${dash(params.utr)}*\n` +
    `• Status: *ACCEPTED — SIMULATED RESPONSE*\n\n` +
    `${deskLines(params.portalA, params.portalB, bank)}\n\n` +
    `Nothing else you need to do here.\n\n` +
    `You can check real-time status anytime by replying *STATUS* to this WhatsApp number.`
  );
}

export function formatRecorded(incidentId: string, prompt?: string): string {
  return `Incident recorded: *${incidentId}*. ${prompt || "Please share additional transaction details or a screenshot."}`;
}

export function optionsFromNextAction(nextAction?: NextAction | null): ConflictOption[] {
  if (!nextAction?.options?.length) return [];
  return nextAction.options.map((opt) => ({ label: opt.label, value: opt.value }));
}
