import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/lib/types/**",
    "!src/**/index.ts",
  ],
  coverageThreshold: {
    global: { lines: 30 },
    "./src/lib/safety/": { lines: 80 },
    "./src/lib/rbac/": { lines: 80 },
    "./src/lib/homomorphic/": { lines: 80 },
    "./src/lib/evolution/": { lines: 50 },
    "./src/lib/federated/": { lines: 50 },
  },
};

export default config;
