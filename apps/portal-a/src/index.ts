import { createPortalAServer } from "./server.js";

export * from "./intake-service.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_PORTAL_A) || 3003;

const isMain = process.argv[1] && (
  process.argv[1].endsWith("apps/portal-a/dist/index.js") ||
  process.argv[1].endsWith("apps\\portal-a\\dist\\index.js") ||
  process.argv[1].endsWith("apps/portal-a/src/index.ts") ||
  process.argv[1].endsWith("apps\\portal-a\\src\\index.ts") ||
  process.env.RAKSHA_AUTOSTART === "true"
);

if (isMain && process.env.NODE_ENV !== "test") {
  const server = createPortalAServer();
  server.listen(PORT, () => {
    console.log(`[Portal A] Intake Server listening on http://localhost:${PORT}`);
  });
}
