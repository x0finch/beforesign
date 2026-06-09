import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/core",
  "packages/detect",
  "packages/clients",
  "packages/orchestrator",
  "packages/ai-pipeline",
  "packages/agent",
]);
