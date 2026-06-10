import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import { runBeforeSignAsk } from "./run_beforesign_ask.ts";
import { normalizeAskInput } from "./normalize_ask_input.ts";
import type { AskInput, AskSession, AskSseEvent } from "./types.ts";
import type { LlmRuntimeConfig } from "./run_context.ts";

export type RunAskSessionOptions = {
  session: AskSession;
  input: AskInput;
  deps: AiPipelineDeps;
  llm?: LlmRuntimeConfig;
};

export async function* runAskSession(
  options: RunAskSessionOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps, llm } = options;
  const normalized = normalizeAskInput(input);
  yield* runBeforeSignAsk({ session, input: normalized, deps, llm });
}
