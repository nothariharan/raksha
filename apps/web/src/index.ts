import { createWebServer } from "./server.js";

export * from "./client-state.js";
export * from "./html-template.js";
export * from "./server.js";

const PORT = Number(process.env.PORT_WEB) || 3000;

if (process.env.NODE_ENV !== "test") {
  const server = createWebServer();
  server.listen(PORT, () => {
    console.log(`[Raksha Web UI] Listening on http://localhost:${PORT}`);
  });
}
