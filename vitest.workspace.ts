import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/core",
  "packages/detect",
  "packages/parse",
  "packages/risk",
  "packages/clients",
  "packages/orchestrator",
]);
