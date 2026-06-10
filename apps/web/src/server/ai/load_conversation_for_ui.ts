import {
  createEmptySession,
  flattenMemoryItems,
  getAgentMemorySession,
  isOpenAIConversationId,
  loadConversationEntries,
  type AskLocale,
} from "@beforesign/agent";
import type { ConversationHydration } from "~/types/conversation.ts";
import { createLlmFromEnv } from "./llm.ts";

export async function loadConversationForUi(
  conversationId: string,
  locale: AskLocale,
): Promise<ConversationHydration> {
  if (!isOpenAIConversationId(conversationId)) {
    throw new Error("Invalid conversationId");
  }

  const llm = createLlmFromEnv();
  if (!llm?.apiKey) {
    throw new Error("LLM is not configured");
  }

  const session = createEmptySession(conversationId);
  getAgentMemorySession(session, llm);
  const items = await loadConversationEntries(session, llm);

  return {
    conversationId,
    locale,
    conversation: flattenMemoryItems(items),
  };
}
