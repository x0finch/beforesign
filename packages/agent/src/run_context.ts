import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import type { NormalizedAskInput } from "./normalize_ask_input.ts";
import type { AskSession, AskSseEvent, AskLocale } from "./types.ts";

export type BeforeSignRunContext = {
  session: AskSession;
  deps: AiPipelineDeps;
  locale: AskLocale;
  normalized: NormalizedAskInput;
  emit: (event: AskSseEvent) => void;
};

export type LlmRuntimeConfig = {
  apiKey: string;
  baseUrl?: string;
  model: string;
};
