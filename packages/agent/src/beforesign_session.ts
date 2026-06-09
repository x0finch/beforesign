import type { Session } from "@openai/agents";
import { OpenAIConversationsSession } from "@openai/agents";
import type { LlmRuntimeConfig } from "./run_context.ts";
import type { AskSession } from "./types.ts";

export function isOpenAIConversationId(id: string | undefined): id is string {
  return typeof id === "string" && id.startsWith("conv");
}

export function getAgentMemorySession(
  session: AskSession,
  llm: LlmRuntimeConfig,
): Session {
  if (!llm.apiKey) {
    throw new Error("LLM apiKey is required for OpenAIConversationsSession");
  }

  if (!session.agentMemory) {
    session.agentMemory = new OpenAIConversationsSession({
      ...(isOpenAIConversationId(session.openaiConversationId)
        ? { conversationId: session.openaiConversationId }
        : {}),
      apiKey: llm.apiKey,
      baseURL: llm.baseUrl,
    });
  }
  return session.agentMemory;
}

/** Persist OpenAI `conv_*` id on AskSession for follow-up turns and session rehydration. */
export async function syncOpenAIConversationId(
  session: AskSession,
  memorySession: Session,
): Promise<void> {
  if (!(memorySession instanceof OpenAIConversationsSession)) return;
  const conversationId = await memorySession.getSessionId();
  if (isOpenAIConversationId(conversationId)) {
    session.openaiConversationId = conversationId;
  }
}
