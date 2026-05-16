import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // E2E specs run with Playwright, not Vitest
    exclude: ["**/node_modules/**", "**/.next/**", "tests/e2e/**"],
  },
})
