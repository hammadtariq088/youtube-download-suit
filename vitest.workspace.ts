import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "shared",
      root: "./shared",
      include: ["src/**/*.test.ts"],
    },
  },
  {
    test: {
      name: "backend",
      root: "./backend",
      include: ["src/**/*.test.ts", "../../tests/**/*.test.ts"],
    },
  },
  {
    test: {
      name: "worker",
      root: "./worker",
      include: ["src/**/*.test.ts", "../../tests/**/*.test.ts"],
    },
  },
  {
    test: {
      name: "frontend",
      root: "./frontend",
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      environment: "jsdom",
    },
  },
]);
