import type { LlmRuntimeConfig } from "@beforesign/agent";
import { getLlmConfig } from "../env.ts";

export function createLlmFromEnv(): LlmRuntimeConfig | undefined {
  return getLlmConfig();
}
