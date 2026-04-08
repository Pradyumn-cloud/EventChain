import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@repo/db": fileURLToPath(new URL("./test/mocks/repo-db.ts", import.meta.url)),
    },
  },
});
