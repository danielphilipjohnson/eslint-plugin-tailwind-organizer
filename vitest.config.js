import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "threads",
    include: ["tests/**/*.test.js", "tests/**/*.vitest.js"],
    exclude: ["tests/rules/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.js", "bin/**/*.js"],
      exclude: ["node_modules", "tests"],
    },
  },
});
