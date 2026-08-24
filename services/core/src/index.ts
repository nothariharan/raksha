import { createCoreServer } from "./server.js";

export * from "./db/connection.js";
export * from "./repositories/index.js";
export * from "./incident-service.js";
export * from "./evidence-service.js";
export * from "./validation-engine.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_CORE) || 3001;

if (process.env.NODE_ENV !== "test") {
  const server = createCoreServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Core] Persistent Server listening on http://localhost:${PORT}`);
  });
}
