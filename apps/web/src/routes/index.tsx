import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { AppHeader } from "~/components/layout/app_header.tsx";
import { ParserDiscovery } from "~/components/parser/parser_discovery.tsx";
import { ParserInput } from "~/components/parser/parser_input.tsx";
import { ParserResult } from "~/components/parser/parser_result.tsx";
import { use_parse } from "~/hooks/use_parse.ts";
import type { locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [locale, set_locale] = React.useState<locale>("zh");
  const [raw, set_raw] = React.useState("");
  const [chain_id, set_chain_id] = React.useState<number | undefined>();
  const [abi, set_abi] = React.useState("");
  const [selected_hit, set_selected_hit] = React.useState<string | undefined>();
  const { loading, error, result, parse, clear } = use_parse();

  const chain_required =
    result?.discovery?.status === "not_found" || result?.discovery?.status === "ambiguous";

  const handle_parse = () => {
    void parse({
      raw: raw.trim(),
      chain_id,
      abi: abi.trim() || undefined,
      selected_discovery_hit: selected_hit,
      locale,
    });
  };

  return (
    <div className="space-y-6">
      <AppHeader locale={locale} on_locale_change={set_locale} />

      <ParserInput
        locale={locale}
        raw={raw}
        on_raw_change={set_raw}
        chain_id={chain_id}
        on_chain_change={set_chain_id}
        abi={abi}
        on_abi_change={set_abi}
        chain_required={chain_required}
        loading={loading}
        on_parse={handle_parse}
        on_clear={() => {
          clear();
          set_raw("");
          set_selected_hit(undefined);
        }}
      />

      {!result && !loading && !error && (
        <div className="card text-center py-12 text-muted">
          <p className="font-medium text-foreground">{t(locale, "empty_title")}</p>
          <p className="text-sm mt-2">{t(locale, "empty_desc")}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="alert-destructive">
          {error}
        </div>
      )}

      {result?.discovery?.status === "ambiguous" && (
        <ParserDiscovery
          locale={locale}
          hits={result.discovery.hits}
          selected_id={selected_hit}
          on_select={set_selected_hit}
          on_continue={handle_parse}
        />
      )}

      {result && result.discovery?.status !== "ambiguous" && (
        <ParserResult locale={locale} result={result} />
      )}
    </div>
  );
}
