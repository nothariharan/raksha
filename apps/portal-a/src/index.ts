import { createPortalAServer } from "./server.js";

export * from "./intake-service.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_PORTAL_A) || 3003;

if (process.env.NODE_ENV !== "test") {
  const server = createPortalAServer();
  server.listen(PORT, () => {
    console.log(`[Portal A] Intake Server listening on http://localhost:${PORT}`);
  });
}
