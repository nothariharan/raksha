import { createCapServer } from "./server.js";

export * from "./capability-registry.js";
export * from "./action-router.js";
export * from "./manifest.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_CAP) || 3002;

const isMain = process.argv[1] && (
  process.argv[1].endsWith("services/cap/dist/index.js") ||
  process.argv[1].endsWith("services\\cap\\dist\\index.js") ||
  process.argv[1].endsWith("services/cap/src/index.ts") ||
  process.argv[1].endsWith("services\\cap\\src\\index.ts") ||
  process.env.RAKSHA_AUTOSTART === "true"
);

if (isMain && process.env.NODE_ENV !== "test") {
  const server = createCapServer();
  server.listen(PORT, () => {
    console.log(`[Raksha CAP] Server listening on http://localhost:${PORT}`);
  });
}
