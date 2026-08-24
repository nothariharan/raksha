import { createPortalAServer } from "./server.js";

export * from "./intake-service.js";
export * from "./server.js";
export * from "./state-machine.js";
export * from "./synthetic-data.js";

const PORT = Number(process.env.PORT_PORTAL_A) || 3003;

if (process.env.NODE_ENV !== "test") {
  const server = createPortalAServer();
  server.listen(PORT, () => {
    console.log(`[Portal A] Cyber fraud intake listening on http://localhost:${PORT}`);
  });
}
