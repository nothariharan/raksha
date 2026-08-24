export * from "./response-service.js";

const PORT = Number(process.env.PORT_PORTAL_B) || 3004;

console.log(`[Portal B] Initialized response console service on port ${PORT}`);
