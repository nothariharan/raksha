import { createWhatsAppWebhookServer } from "./webhook.js";

export * from "./conversation-store.js";
export * from "./message-normalizer.js";
export * from "./whatsapp-service.js";
export * from "./webhook.js";

const PORT = Number(process.env.PORT_WHATSAPP) || 3005;

if (process.env.NODE_ENV !== "test") {
  const server = createWhatsAppWebhookServer();
  server.listen(PORT, () => {
    console.log(`[Raksha WhatsApp Agent] Listening on http://localhost:${PORT}`);
  });
}
