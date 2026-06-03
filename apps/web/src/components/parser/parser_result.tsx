import type { parse_result } from "@beforesign/core";
import * as React from "react";
import type { locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";
import { ParserStatusBar } from "./parser_status_bar.tsx";
import { ParserRiskStrip } from "./parser_risk_strip.tsx";

export function ParserResult({
  locale,
  result,
}: {
  locale: locale;
  result: parse_result;
}) {
  const [tab, set_tab] = React.useState("summary");

  const tabs = [
    { id: "summary", label: t(locale, "tab_summary") },
    { id: "tx", label: t(locale, "tab_tx") },
    { id: "calldata", label: t(locale, "tab_calldata") },
    { id: "typed", label: t(locale, "tab_typed") },
    { id: "onchain", label: t(locale, "tab_onchain") },
    { id: "raw", label: t(locale, "tab_raw") },
  ];

  return (
    <section className="card space-y-4 animate-in">
      <ParserStatusBar locale={locale} result={result} />
      <ParserRiskStrip locale={locale} result={result} />
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            className={tab === tb.id ? "tab-active" : "tab"}
            onClick={() => set_tab(tb.id)}
          >
            {tb.label}
          </button>
        ))}
      </div>
      <div className="text-sm">
        {tab === "summary" && (
          <div className="space-y-2">
            <p>{result.explanation ?? result.summary}</p>
            {result.missing_fields && result.missing_fields.length > 0 && (
              <p className="text-muted">
                Missing: {result.missing_fields.join(", ")}
              </p>
            )}
          </div>
        )}
        {tab === "tx" && result.tx && (
          <pre className="code-block">{JSON.stringify(result.tx, null, 2)}</pre>
        )}
        {tab === "calldata" && result.calldata && (
          <pre className="code-block">{JSON.stringify(result.calldata, null, 2)}</pre>
        )}
        {tab === "typed" && result.typed_data && (
          <pre className="code-block">{JSON.stringify(result.typed_data, null, 2)}</pre>
        )}
        {tab === "onchain" && result.onchain && (
          <div className="space-y-2">
            <pre className="code-block">{JSON.stringify(result.onchain, null, 2)}</pre>
            {result.onchain.explorer_url && (
              <a className="text-link" href={result.onchain.explorer_url} target="_blank" rel="noreferrer">
                Explorer
              </a>
            )}
          </div>
        )}
        {tab === "raw" && (
          <pre className="code-block">{JSON.stringify(result.raw ?? result, null, 2)}</pre>
        )}
      </div>
    </section>
  );
}
