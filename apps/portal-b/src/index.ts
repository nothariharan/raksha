import { createPortalBServer } from "./server.js";

export * from "./response-service.js";
export * from "./server.js";
export * from "./state-machine.js";

const PORT = Number(process.env.PORT_PORTAL_B) || 3004;

if (process.env.NODE_ENV !== "test") {
  const server = createPortalBServer();
  server.listen(PORT, () => {
    console.log(`[Portal B] Financial response console listening on http://localhost:${PORT}`);
  });
}
