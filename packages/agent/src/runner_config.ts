import {
  OpenAIProvider,
  Runner,
  setDefaultOpenAIKey,
  setOpenAIAPI,
  setTracingExportApiKey,
} from "@openai/agents";
import type { LlmRuntimeConfig } from "./run_context.ts";

let configuredKey: string | undefined;
let runner: Runner | undefined;

export function createRunner(config: LlmRuntimeConfig): Runner {
  if (runner && configuredKey === config.apiKey) {
    return runner;
  }

  setOpenAIAPI("chat_completions");
  setDefaultOpenAIKey(config.apiKey);
  setTracingExportApiKey(config.apiKey);
  configuredKey = config.apiKey;

  runner = new Runner({
    model: config.model,
    modelProvider: new OpenAIProvider({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      useResponses: false,
    }),
  });

  return runner;
}

export function resetRunnerForTests(): void {
  runner = undefined;
  configuredKey = undefined;
}
