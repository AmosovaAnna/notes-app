import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const appDir = fileURLToPath(new URL("./app", import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "~": appDir,
      "@": appDir,
    },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.spec.ts"],
    restoreMocks: true,
  },
})
