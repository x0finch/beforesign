import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { encodeSseEvent, iterateAskEvents } from "~/server/ai/run_ask_stream.ts";

const askBodySchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1),
  raw: z.string().optional(),
  chainId: z.number().int().positive().optional(),
  abi: z.string().optional(),
  signerAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  selectedDiscoveryHit: z.string().optional(),
  locale: z.enum(["zh", "en"]),
});

export const Route = createFileRoute("/api/ai/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = askBodySchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const event of iterateAskEvents(parsed.data)) {
                controller.enqueue(encoder.encode(encodeSseEvent(event)));
              }
            } catch (e) {
              const message = e instanceof Error ? e.message : "Stream failed";
              controller.enqueue(
                encoder.encode(
                  encodeSseEvent({ type: "error", message }),
                ),
              );
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
