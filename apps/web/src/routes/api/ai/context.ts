import {
  buildAgentContextExport,
  createEmptySession,
  getAgentMemorySession,
  isOpenAIConversationId,
} from "@beforesign/agent";
import { createFileRoute } from "@tanstack/react-router";
import { createLlmFromEnv } from "~/server/ai/llm.ts";

export const Route = createFileRoute("/api/ai/context")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const conversationId = url.searchParams.get("conversationId");
        const locale = url.searchParams.get("locale");

        if (!conversationId) {
          return new Response(JSON.stringify({ error: "conversationId is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!isOpenAIConversationId(conversationId)) {
          return new Response(JSON.stringify({ error: "Invalid conversationId" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (locale !== "zh" && locale !== "en") {
          return new Response(JSON.stringify({ error: "locale is required (zh or en)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const llm = createLlmFromEnv();
        if (!llm?.apiKey) {
          return new Response(JSON.stringify({ error: "LLM is not configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        const session = createEmptySession(conversationId);
        getAgentMemorySession(session, llm);

        const exportData = await buildAgentContextExport(session, locale, llm);

        return new Response(JSON.stringify(exportData, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="agent-context-${conversationId}.json"`,
          },
        });
      },
    },
  },
});
