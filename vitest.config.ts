import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@raksha/schemas": path.resolve(__dirname, "./packages/schemas/src/index.ts"),
      "@raksha/shared": path.resolve(__dirname, "./packages/shared/src/index.ts"),
      "@raksha/cap-sdk": path.resolve(__dirname, "./packages/cap-sdk/src/index.ts"),
      "@raksha/i18n": path.resolve(__dirname, "./packages/i18n/src/index.ts"),
      "@raksha/core": path.resolve(__dirname, "./services/core/src/index.ts"),
      "@raksha/cap": path.resolve(__dirname, "./services/cap/src/index.ts"),
      "@raksha/portal-a": path.resolve(__dirname, "./apps/portal-a/src/index.ts"),
      "@raksha/portal-b": path.resolve(__dirname, "./apps/portal-b/src/index.ts"),
    },
  },
});
