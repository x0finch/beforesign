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

  const missingWarnings =
    result.view?.warnings?.filter((warning) => warning.code === "missingField") ?? [];

  const tabs = [
    { id: "summary", label: t(locale, "tabSummary") },
    ...(result.view ? [{ id: "review", label: t(locale, "tabReview") }] : []),
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
            <p>{result.view?.summary ?? result.summary}</p>
            {missingWarnings.length > 0 && (
              <p className="text-muted-foreground">
                Missing: {missingWarnings.map((warning) => warning.message).join(", ")}
              </p>
            )}
          </div>
        </TabsPanel>

        {result.view && (
          <TabsPanel value="review" className="pt-3 text-sm">
            <SpecRenderer spec={result.view.spec as unknown as Spec} />
          </TabsPanel>
        )}

        <TabsPanel value="raw" className="pt-3 text-sm">
          <pre className="code-block">{JSON.stringify(result.raw ?? result, null, 2)}</pre>
        </TabsPanel>
      </Tabs>
    </section>
  );
}
