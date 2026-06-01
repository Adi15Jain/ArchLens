import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        passWithNoTests: true,
        include: [
            "packages/*/src/**/*.test.ts",
            "packages/*/__tests__/**/*.test.ts",
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "json-summary"],
            include: ["packages/*/src/**/*.ts"],
            exclude: ["**/*.test.ts", "**/*.d.ts", "**/index.ts"],
        },
    },
});
