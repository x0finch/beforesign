import { createServerFn } from "@tanstack/react-start";
import type { AskLocale } from "@beforesign/agent";
import type { ConversationHydration } from "~/types/conversation.ts";
import { loadConversationForUi } from "./load_conversation_for_ui.ts";

export const loadConversationServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { conversationId: string; locale: AskLocale }) => data)
  .handler(async ({ data }): Promise<ConversationHydration> => {
    return loadConversationForUi(data.conversationId, data.locale);
  });
