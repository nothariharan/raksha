import { createPhoneWebhookServer } from "./webhook.js";

export * from "./providers/interface.js";
export * from "./providers/elevenlabs-provider.js";
export * from "./providers/twilio-provider.js";
export * from "./providers/exotel-provider.js";
export * from "./session-manager.js";
export * from "./phone-tools.js";
export * from "./elevenlabs-webhook.js";
export * from "./phone-service.js";
export * from "./webhook.js";

const PORT = Number(process.env.PORT_PHONE) || 3006;

const isMain = process.argv[1] && (
  process.argv[1].endsWith("agents/phone/dist/index.js") ||
  process.argv[1].endsWith("agents\\phone\\dist\\index.js") ||
  process.argv[1].endsWith("agents/phone/src/index.ts") ||
  process.argv[1].endsWith("agents\\phone\\src\\index.ts") ||
  process.env.RAKSHA_AUTOSTART === "true"
);

if (isMain && process.env.NODE_ENV !== "test") {
  const server = createPhoneWebhookServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Phone Telephony Agent] Listening on http://localhost:${PORT}`);
  });
}
