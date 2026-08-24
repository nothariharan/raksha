import { createCoreServer } from "./server.js";

export * from "./db/connection.js";
export * from "./repositories/index.js";
export * from "./incident-service.js";
export * from "./evidence-service.js";
export * from "./validation-engine.js";
export * from "./extraction/index.js";
export * from "./reconciliation/reconciler.js";
export * from "./clarification/clarification-engine.js";
export * from "./orchestration/process-service.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_CORE) || 3001;

if (process.env.NODE_ENV !== "test") {
  const server = createCoreServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Core] Multimodal Server listening on http://localhost:${PORT}`);
  });
}
