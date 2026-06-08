import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/core",
  "packages/detect",
  "packages/parse",
  "packages/clients",
  "packages/orchestrator",
]);
