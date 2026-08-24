import { createCoreServer } from "./server.js";

export * from "./incident-service.js";
export * from "./evidence-service.js";
export * from "./validation-engine.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_CORE) || 3001;

if (process.env.NODE_ENV !== "test") {
  const server = createCoreServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Core] Server listening on http://localhost:${PORT}`);
  });
}
