import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import { runAgentLoop } from "./agent_loop.ts";
import { appendMessage } from "./session_state.ts";
import type { AskInput, AskSession, AskSseEvent, LlmStream } from "./types.ts";

export type RunAskSessionOptions = {
  session: AskSession;
  input: AskInput;
  deps: AiPipelineDeps;
  llm?: LlmStream;
};

export async function* runAskSession(
  options: RunAskSessionOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps, llm } = options;

  appendMessage(session, "user", input.message);

  yield* runAgentLoop({ session, input, deps, llm });
}
