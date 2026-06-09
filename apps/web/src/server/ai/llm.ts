import { createOpenAiCompatibleLlm } from "@beforesign/agent";
import { getLlmConfig } from "../env.ts";

export function createLlmFromEnv() {
  const config = getLlmConfig();
  if (!config) return undefined;
  return createOpenAiCompatibleLlm(config);
}
