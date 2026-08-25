import { createPortalBServer } from "./server.js";

export * from "./response-service.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_PORTAL_B) || 3004;

const isMain = process.argv[1] && (
  process.argv[1].endsWith("apps/portal-b/dist/index.js") ||
  process.argv[1].endsWith("apps\\portal-b\\dist\\index.js") ||
  process.argv[1].endsWith("apps/portal-b/src/index.ts") ||
  process.argv[1].endsWith("apps\\portal-b\\src\\index.ts") ||
  process.env.RAKSHA_AUTOSTART === "true"
);

if (isMain && process.env.NODE_ENV !== "test") {
  const server = createPortalBServer();
  server.listen(PORT, () => {
    console.log(`[Portal B] Bank Response Console listening on http://localhost:${PORT}`);
  });
}
