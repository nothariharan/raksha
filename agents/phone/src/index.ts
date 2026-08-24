import { createPhoneWebhookServer } from "./webhook.js";

export * from "./providers/interface.js";
export * from "./providers/elevenlabs-provider.js";
export * from "./providers/twilio-provider.js";
export * from "./providers/exotel-provider.js";
export * from "./session-manager.js";
export * from "./phone-tools.js";
export * from "./phone-service.js";
export * from "./webhook.js";

const PORT = Number(process.env.PORT_PHONE) || 3006;

if (process.env.NODE_ENV !== "test") {
  const server = createPhoneWebhookServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Phone Telephony Agent] Listening on http://localhost:${PORT}`);
  });
}
