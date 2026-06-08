import type { ParseResult } from "@beforesign/core";
import { SpecRenderer } from "@beforesign/json-render-view";
import type { Spec } from "@beforesign/json-render-catalog";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@beforesign/ui/tabs";
import * as React from "react";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";
import { ParserStatusBar } from "./parser_status_bar.tsx";
import { ParserRiskStrip } from "./parser_risk_strip.tsx";

export function ParserResult({
  locale,
  result,
}: {
  locale: Locale;
  result: ParseResult;
}) {
  const defaultTab = result.view ? "review" : "summary";
  const [tab, setTab] = React.useState(defaultTab);

  React.useEffect(() => {
    setTab(result.view ? "review" : "summary");
  }, [result.view, result.kind]);

  const tabs = [
    { id: "summary", label: t(locale, "tabSummary") },
    ...(result.view ? [{ id: "review", label: t(locale, "tabReview") }] : []),
    { id: "tx", label: t(locale, "tabTx") },
    ...(!result.view ? [{ id: "calldata", label: t(locale, "tabCalldata") }] : []),
    { id: "onchain", label: t(locale, "tabOnchain") },
    { id: "raw", label: t(locale, "tabRaw") },
  ];

  return (
    <section className="card space-y-4 animate-in">
      <ParserStatusBar locale={locale} result={result} />
      <ParserRiskStrip locale={locale} result={result} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList
          variant="underline"
          className="w-full justify-start border-b border-border [&_[data-slot=tab-indicator]]:hidden"
        >
          {tabs.map((tb) => (
            <TabsTab key={tb.id} value={tb.id}>
              {tb.label}
            </TabsTab>
          ))}
        </TabsList>

        <TabsPanel value="summary" className="pt-3 text-sm">
          <div className="space-y-2">
            <p>{result.explanation ?? result.view?.summary ?? result.summary}</p>
            {result.missingFields && result.missingFields.length > 0 && (
              <p className="text-muted-foreground">Missing: {result.missingFields.join(", ")}</p>
            )}
          </div>
        </TabsPanel>

        {result.view && (
          <TabsPanel value="review" className="pt-3 text-sm">
            <SpecRenderer spec={result.view.spec as unknown as Spec} />
          </TabsPanel>
        )}

        <TabsPanel value="tx" className="pt-3 text-sm">
          {result.tx && <pre className="code-block">{JSON.stringify(result.tx, null, 2)}</pre>}
        </TabsPanel>

        {!result.view && (
          <TabsPanel value="calldata" className="pt-3 text-sm">
            {result.calldata && (
              <pre className="code-block">{JSON.stringify(result.calldata, null, 2)}</pre>
            )}
          </TabsPanel>
        )}

        <TabsPanel value="onchain" className="pt-3 text-sm">
          {result.onchain && (
            <div className="space-y-2">
              <pre className="code-block">{JSON.stringify(result.onchain, null, 2)}</pre>
              {result.onchain.explorerUrl && (
                <a
                  className="text-link"
                  href={result.onchain.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explorer
                </a>
              )}
            </div>
          )}
        </TabsPanel>

        <TabsPanel value="raw" className="pt-3 text-sm">
          <pre className="code-block">{JSON.stringify(result.raw ?? result, null, 2)}</pre>
        </TabsPanel>
      </Tabs>
    </section>
  );
}
