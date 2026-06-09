import { buildAgentContextExport } from "@beforesign/agent";
import { createFileRoute } from "@tanstack/react-router";
import { getSession, saveSession } from "~/server/ai/session_store.ts";

export const Route = createFileRoute("/api/ai/context")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("sessionId");
        if (!sessionId) {
          return new Response(JSON.stringify({ error: "sessionId is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const session = await getSession(sessionId);
        if (!session) {
          return new Response(JSON.stringify({ error: "Session not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!session.lastNormalizedInput) {
          return new Response(
            JSON.stringify({ error: "No context export for this session yet" }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const exportData = await buildAgentContextExport(
          session,
          session.lastNormalizedInput,
        );
        session.lastContextExport = exportData;
        session.updatedAt = Date.now();
        await saveSession(session);

        return new Response(JSON.stringify(exportData, null, 2), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="agent-context-${sessionId}.json"`,
          },
        });
      },
    },
  },
});
