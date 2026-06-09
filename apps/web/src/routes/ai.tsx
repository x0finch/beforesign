import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { AiPage } from "~/components/ai/ai_page.tsx";
import type { Locale } from "~/lib/i18n.ts";

type AiSearch = {
  raw?: string;
};

export const Route = createFileRoute("/ai")({
  validateSearch: (search: Record<string, unknown>): AiSearch => ({
    raw: typeof search.raw === "string" ? search.raw : undefined,
  }),
  component: AiRoutePage,
});

function AiRoutePage() {
  const [locale, setLocale] = React.useState<Locale>("zh");
  const { raw: rawFromQuery } = Route.useSearch();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (rawFromQuery) {
      navigate({ to: "/ai", search: {}, replace: true });
    }
  }, [rawFromQuery, navigate]);

  return <AiPage locale={locale} onLocaleChange={setLocale} initialRaw={rawFromQuery} />;
}
