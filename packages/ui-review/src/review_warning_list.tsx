import type { ReviewDocument, WarningItem } from "@beforesign/core";
import { Alert, AlertDescription, AlertTitle } from "@beforesign/ui/alert";
import { ReviewSection } from "./review_section.tsx";

function alertVariant(
  severity: WarningItem["severity"],
): "default" | "error" | "info" | "warning" {
  if (severity === "destructive") return "error";
  if (severity === "warning") return "warning";
  if (severity === "info") return "info";
  return "default";
}

function ReviewWarningAlerts({ warnings }: { warnings: WarningItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {warnings.map((w) => (
        <Alert key={`${w.code}-${w.message}`} variant={alertVariant(w.severity)}>
          <AlertTitle>{w.code}</AlertTitle>
          <AlertDescription>{w.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

export function ReviewWarningList({
  warnings,
  showHeading = true,
}: {
  warnings: WarningItem[];
  showHeading?: boolean;
}) {
  if (warnings.length === 0) return null;

  const alerts = <ReviewWarningAlerts warnings={warnings} />;

  if (!showHeading) return alerts;

  return (
    <ReviewSection id="warnings" title="Warnings">
      {alerts}
    </ReviewSection>
  );
}

export function dedupeWarnings(
  document: ReviewDocument,
  extraWarnings?: WarningItem[],
): WarningItem[] {
  const codes = new Set(document.warnings.map((w) => w.code));
  const merged = [...document.warnings];
  for (const w of extraWarnings ?? []) {
    if (!codes.has(w.code)) {
      merged.push(w);
      codes.add(w.code);
    }
  }
  return merged;
}
