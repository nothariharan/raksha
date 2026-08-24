import { createCapServer } from "./server.js";

export * from "./capability-registry.js";
export * from "./action-router.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_CAP) || 3002;

if (process.env.NODE_ENV !== "test") {
  const server = createCapServer();
  server.listen(PORT, () => {
    console.log(`[Raksha CAP] Server listening on http://localhost:${PORT}`);
  });
}
