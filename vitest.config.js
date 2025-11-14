import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    pool: "threads",
    include: ["tests/**/*.test.js", "tests/**/*.vitest.js", "tests/rules/organize-classnames-helpers.test.js"],

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.js", "bin/**/*.js"],
      exclude: ["node_modules", "tests"],
    },
  },
});
