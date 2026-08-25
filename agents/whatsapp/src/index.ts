import { createWhatsAppWebhookServer } from "./webhook.js";

export * from "./conversation-store.js";
export * from "./message-normalizer.js";
export * from "./whatsapp-service.js";
export * from "./webhook.js";

const PORT = Number(process.env.PORT_WHATSAPP) || 3005;

const isMain = process.argv[1] && (
  process.argv[1].endsWith("agents/whatsapp/dist/index.js") ||
  process.argv[1].endsWith("agents\\whatsapp\\dist\\index.js") ||
  process.argv[1].endsWith("agents/whatsapp/src/index.ts") ||
  process.argv[1].endsWith("agents\\whatsapp\\src\\index.ts") ||
  process.env.RAKSHA_AUTOSTART === "true"
);

if (isMain && process.env.NODE_ENV !== "test") {
  const server = createWhatsAppWebhookServer();
  server.listen(PORT, () => {
    console.log(`[Raksha WhatsApp Agent] Listening on http://localhost:${PORT}`);
  });
}
