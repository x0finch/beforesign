import type { AskLocale } from "@beforesign/agent";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ConversationLoadError } from "~/components/ai/conversation_load_error.tsx";
import { ConversationPending } from "~/components/ai/conversation_pending.tsx";
import { loadConversationServerFn } from "~/server/ai/load_conversation_server_fn.ts";

function isOpenAIConversationId(id: string): boolean {
  return id.startsWith("conv");
}

type ConvSearch = {
  locale: AskLocale;
};

export const Route = createFileRoute("/_chat/c/$conversationId")({
  validateSearch: (search: Record<string, unknown>): ConvSearch => ({
    locale: search.locale === "en" ? "en" : "zh",
  }),
  beforeLoad: ({ params }) => {
    if (!isOpenAIConversationId(params.conversationId)) {
      throw redirect({ to: "/" });
    }
  },
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, deps }) => {
    return loadConversationServerFn({
      data: { conversationId: params.conversationId, locale: deps.locale },
    });
  },
  pendingComponent: ConversationPending,
  errorComponent: ConversationLoadError,
});
