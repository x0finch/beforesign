import type { ReviewCheckItem } from "@beforesign/core";
import { Field, FieldDescription, FieldLabel } from "@beforesign/ui/field";
import { cn } from "@beforesign/ui/utils";

export type ReviewSectionItemLayout = "keyValue" | "guidance";

const rowBaseClass = cn(
  "-mx-2 px-2 py-2.5 leading-none transition-colors",
  "hover:bg-black/5 dark:hover:bg-white/10",
);

const highlightClass = cn(
  "bg-blue-100 dark:bg-blue-950/55",
  "hover:bg-blue-200 dark:hover:bg-blue-900/60",
);

const keyValueGridClass =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 whitespace-normal min-h-[3.875rem]";

export function ReviewSectionItem({
  check,
  layout = "keyValue",
  showId = true,
}: {
  check: ReviewCheckItem;
  layout?: ReviewSectionItemLayout;
  showId?: boolean;
}) {
  const display = check.displayValue ?? check.value;
  const highlighted = check.highlight === true;
  const destructive = check.risk === "destructive";
  const highlightCellClass = highlighted ? highlightClass : undefined;

  if (layout === "guidance") {
    return (
      <div
        data-check-id={check.id}
        data-slot="review-section-item"
        className={cn(rowBaseClass, highlightCellClass)}
      >
        <Field>
          <FieldLabel>{check.label}</FieldLabel>
          <FieldDescription className="whitespace-normal">{check.value}</FieldDescription>
        </Field>
      </div>
    );
  }

  const valueClass = cn(
    "min-w-0 text-right break-all [overflow-wrap:anywhere]",
    destructive && "font-medium text-destructive",
  );

  if (!showId) {
    return (
      <div
        data-check-id={check.id}
        data-slot="review-section-item"
        data-highlight={highlighted ? "true" : undefined}
        className={cn(rowBaseClass, keyValueGridClass, "items-center", highlightCellClass)}
      >
        <Field className="min-w-0">
          <FieldLabel>{check.label}</FieldLabel>
        </Field>
        <div className={valueClass}>{display}</div>
      </div>
    );
  }

  return (
    <div
      data-check-id={check.id}
      data-slot="review-section-item"
      data-highlight={highlighted ? "true" : undefined}
      className={cn(
        rowBaseClass,
        keyValueGridClass,
        "grid-rows-[auto_1fr] gap-y-2",
        highlightCellClass,
      )}
    >
      <Field className="contents">
        <FieldDescription className="col-span-2 row-start-1 min-w-0">{check.id}</FieldDescription>
        <FieldLabel className="col-start-1 row-start-2 min-w-0 self-center">{check.label}</FieldLabel>
      </Field>
      <div className={cn("col-start-2 row-start-2 self-center", valueClass)}>{display}</div>
    </div>
  );
}
