import { createFileRoute } from "@tanstack/react-router";

type AiSearch = {
  raw?: string;
};

export const Route = createFileRoute("/_chat/")({
  validateSearch: (search: Record<string, unknown>): AiSearch => ({
    raw: typeof search.raw === "string" ? search.raw : undefined,
  }),
});
