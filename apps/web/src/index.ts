import { createWebServer } from "./server.js";

export * from "./client-state.js";
export * from "./html-template.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_WEB) || 3000;

const isMain = process.argv[1] && (
  process.argv[1].endsWith("apps/web/dist/index.js") ||
  process.argv[1].endsWith("apps\\web\\dist\\index.js") ||
  process.argv[1].endsWith("apps/web/src/index.ts") ||
  process.argv[1].endsWith("apps\\web\\src\\index.ts") ||
  process.env.RAKSHA_AUTOSTART === "true"
);

if (isMain && process.env.NODE_ENV !== "test") {
  const server = createWebServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Web UI] Listening on http://localhost:${PORT}`);
  });
}
