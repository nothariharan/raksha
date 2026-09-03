import { fileURLToPath } from "node:url";
import { createCoreServer } from "./server.js";

export * from "./db/connection.js";
export * from "./db/identity-allocator.js";
export * from "./db/wire-identity.js";
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

const isMain = process.argv[1] && (
  process.argv[1].endsWith("services/core/dist/index.js") ||
  process.argv[1].endsWith("services\\core\\dist\\index.js") ||
  process.argv[1].endsWith("services/core/src/index.ts") ||
  process.argv[1].endsWith("services\\core\\src\\index.ts") ||
  process.env.RAKSHA_AUTOSTART === "true"
);

if (isMain && process.env.NODE_ENV !== "test") {
  const server = createCoreServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Core] Multimodal Server listening on http://localhost:${PORT}`);
  });
}
