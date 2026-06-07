import { Link, createFileRoute } from "@tanstack/react-router";
import {
  DEMO_CASE_META,
  PARSE_FIXTURE_CASES,
  buildDemoParseOptions,
  type DemoParseCase,
} from "~/demo/calldata_parse/index.ts";
import { parseCalldata } from "@beforesign/calldata-parse";
import type { CalldataCall } from "@beforesign/calldata-parse";
import * as React from "react";
import { AfterPanel } from "~/components/demo/calldata_parse/after_panel.tsx";
import { BeforePanel } from "~/components/demo/calldata_parse/before_panel.tsx";

export const Route = createFileRoute("/demo/calldata-parse")({
  component: CalldataParseDemoPage,
});

function CalldataParseDemoPage() {
  const [selectedName, setSelectedName] = React.useState(PARSE_FIXTURE_CASES[0]?.name ?? "transfer");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [tree, setTree] = React.useState<CalldataCall | null>(null);

  const fixture = React.useMemo(
    () => PARSE_FIXTURE_CASES.find((item) => item.name === selectedName) ?? PARSE_FIXTURE_CASES[0],
    [selectedName],
  );

  React.useEffect(() => {
    if (!fixture) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void parseCalldata(fixture.input, buildDemoParseOptions(fixture))
      .then((result) => {
        if (!cancelled) {
          setTree(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setTree(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fixture]);

  const meta = fixture ? DEMO_CASE_META[fixture.name] : undefined;

  return (
    <div className="space-y-6 w-[min(100vw-2rem,72rem)] relative left-1/2 -translate-x-1/2">
      <header className="flex flex-wrap items-start justify-between gap-4 py-4 border-b border-border">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/80">Developer demo</p>
          <h1 className="text-xl font-semibold tracking-tight">calldata-parse</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live parseCalldata on built-in fixtures — before and after comparison.
          </p>
        </div>
        <Link to="/" className="btn-ghost text-sm">
          Back to parser
        </Link>
      </header>

      <FixturePicker selectedName={selectedName} onSelect={setSelectedName} />

      {fixture && meta ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <BeforePanel label={meta.label} description={meta.description} input={fixture.input} />
          <AfterPanel loading={loading} error={error} tree={tree} />
        </div>
      ) : null}
    </div>
  );
}

function FixturePicker({
  selectedName,
  onSelect,
}: {
  selectedName: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PARSE_FIXTURE_CASES.map((fixture) => {
        const meta = DEMO_CASE_META[fixture.name];
        const active = fixture.name === selectedName;
        return (
          <button
            key={fixture.name}
            type="button"
            onClick={() => onSelect(fixture.name)}
            className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground hover:border-muted-foreground/40"
            }`}
          >
            <span className="font-medium block">{meta?.label ?? fixture.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export type { DemoParseCase };
