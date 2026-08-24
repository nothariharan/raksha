/**
 * WhatsApp Message Normalizer
 * Transforms incoming Twilio / Meta Webhook payloads into channel-independent InputEvents.
 */

import { NormalizedInputEvent } from "@raksha/schemas";

export interface RawWhatsAppPayload {
  From?: string;
  from?: string;
  To?: string;
  to?: string;
  Body?: string;
  body?: string;
  text?: string;
  MessageSid?: string;
  messageId?: string;
  id?: string;
  MediaUrl0?: string;
  mediaUrl?: string;
  MediaContentType0?: string;
  mimeType?: string;
  type?: "text" | "image" | "voice" | "audio" | "document" | "interactive";
  ocrText?: string;
  audioTranscript?: string;
  language?: string;
}

export class WhatsAppMessageNormalizer {
  static normalize(payload: RawWhatsAppPayload): NormalizedInputEvent {
    const rawPhone = payload.From || payload.from || "+919876543210";
    const senderPhone = rawPhone.replace(/whatsapp:/i, "").trim();
    const messageId = payload.MessageSid || payload.messageId || payload.id || `msg-${Date.now()}`;
    const textContent = (payload.Body || payload.body || payload.text || "").trim();
    const mediaUrl = payload.MediaUrl0 || payload.mediaUrl;
    const mimeType = payload.MediaContentType0 || payload.mimeType || "";
    const language = payload.language;

    // 1. Check for Confirmation / Button Reply
    const isConfirmation = /^(yes|no|report|confirm|haan|ha|हाँ|சரி|1|2)$/i.test(textContent);
    if (isConfirmation && !mediaUrl) {
      return {
        type: "CONFIRMATION",
        source: "whatsapp",
        value: textContent.toUpperCase(),
        language,
        messageId,
        senderPhone,
      };
    }

    // 2. Check for Voice / Audio Note
    const isVoice =
      payload.type === "voice" ||
      payload.type === "audio" ||
      mimeType.startsWith("audio/") ||
      Boolean(payload.audioTranscript);

    if (isVoice) {
      return {
        type: "VOICE",
        source: "whatsapp",
        mediaUrl: mediaUrl || `synthetic://whatsapp/voice/${messageId}.ogg`,
        audioTranscript: payload.audioTranscript || textContent,
        language,
        messageId,
        senderPhone,
      };
    }

    // 3. Check for Image / Screenshot Receipt
    const isImage =
      payload.type === "image" ||
      payload.type === "document" ||
      mimeType.startsWith("image/") ||
      Boolean(mediaUrl);

    if (isImage) {
      return {
        type: "IMAGE",
        source: "whatsapp",
        mediaUrl: mediaUrl || `synthetic://whatsapp/image/${messageId}.jpg`,
        ocrText: payload.ocrText || textContent,
        language,
        messageId,
        senderPhone,
      };
    }

    // 4. Default to Plain Text Narrative
    return {
      type: "TEXT",
      source: "whatsapp",
      text: textContent,
      language,
      messageId,
      senderPhone,
    };
  }
}
