import { runAskSession } from "@beforesign/agent";
import type { AskInput, AskSseEvent } from "@beforesign/agent";
import { createDepsFromKeys } from "@beforesign/ai-pipeline";
import { getApiKeys } from "../env.ts";
import { createLlmFromEnv } from "./llm.ts";

export function encodeSseEvent(event: AskSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function* iterateAskEvents(
  input: AskInput,
): AsyncGenerator<AskSseEvent> {
  const session = { id: input.conversationId ?? "" };
  const deps = createDepsFromKeys(getApiKeys());
  const llm = createLlmFromEnv();

  yield* runAskSession({
    session,
    input,
    deps,
    llm,
  });
}
