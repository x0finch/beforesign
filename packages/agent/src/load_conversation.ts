import type { AgentInputItem } from "@openai/agents";
import { getAgentMemorySession } from "./beforesign_session.ts";
import type { LlmRuntimeConfig } from "./run_context.ts";
import type { AskSession } from "./types.ts";

export async function loadConversationEntries(
  session: AskSession,
  llm: LlmRuntimeConfig,
): Promise<AgentInputItem[]> {
  const memory = getAgentMemorySession(session, llm);
  return memory.getItems();
}
