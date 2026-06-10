import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: [
        "components/**/*.ts",
        "components/**/*.tsx",
        "services/**/*.ts",
        "utils/**/*.ts",
        "hooks/**/*.ts",
        "store/**/*.ts",
      ],
      exclude: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    },
  },
});
