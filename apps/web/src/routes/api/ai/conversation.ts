import { createOpenAIConversation } from "@beforesign/agent";
import { createFileRoute } from "@tanstack/react-router";
import { createLlmFromEnv } from "~/server/ai/llm.ts";

export const Route = createFileRoute("/api/ai/conversation")({
  server: {
    handlers: {
      POST: async () => {
        const llm = createLlmFromEnv();
        if (!llm?.apiKey) {
          return new Response(JSON.stringify({ error: "LLM is not configured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const conversationId = await createOpenAIConversation(llm);
          return new Response(JSON.stringify({ conversationId }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Failed to create conversation";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
