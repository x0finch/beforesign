import type { ParseResult } from "@beforesign/core";
import * as React from "react";
import type { Locale } from "~/lib/i18n.ts";

export function ParserRiskStrip({
  locale,
  result,
}: {
  locale: Locale;
  result: ParseResult;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const warnings = result.warnings;
  if (warnings.length === 0) return null;

  const visible = expanded ? warnings : warnings.slice(0, 3);

  return (
    <div className="space-y-2">
      {visible.map((w) => (
        <div
          key={`${w.code}-${w.message}`}
          role="alert"
          className={
            w.severity === "destructive"
              ? "alert-destructive"
              : w.severity === "warning"
                ? "alert-warning"
                : "alert-info"
          }
        >
          {w.message}
        </div>
      ))}
      {warnings.length > 3 && (
        <button
          type="button"
          className="text-sm text-muted underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "…" : `+${warnings.length - 3}`}
        </button>
      )}
    </div>
  );
}
