import type { AskLocale, ConversationEntry } from "@beforesign/agent";

export type ConversationHydration = {
  conversationId: string;
  locale: AskLocale;
  conversation: ConversationEntry[];
};
