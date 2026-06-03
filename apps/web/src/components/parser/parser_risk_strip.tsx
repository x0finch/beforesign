import type { parse_result } from "@beforesign/core";
import * as React from "react";
import type { locale } from "~/lib/i18n.ts";

export function ParserRiskStrip({
  locale,
  result,
}: {
  locale: locale;
  result: parse_result;
}) {
  const [expanded, set_expanded] = React.useState(false);
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
          {locale === "en" && w.message_en ? w.message_en : w.message}
        </div>
      ))}
      {warnings.length > 3 && (
        <button type="button" className="text-sm text-muted underline" onClick={() => set_expanded(!expanded)}>
          {expanded ? "…" : `+${warnings.length - 3}`}
        </button>
      )}
    </div>
  );
}
