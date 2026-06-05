import type { ReviewCheckItem } from "@beforesign/core";
import { Field, FieldDescription, FieldLabel } from "@beforesign/ui/field";
import { cn } from "@beforesign/ui/utils";

const rowBaseClass = cn(
  "px-2 py-2.5 transition-colors",
  "hover:bg-black/5 dark:hover:bg-white/10",
);

const highlightClass = cn(
  "bg-blue-100 dark:bg-blue-950/55",
  "hover:bg-blue-200 dark:hover:bg-blue-900/60",
);

const keyValueGridClass =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 whitespace-normal min-h-[3.875rem]";

const idRowClass = "col-span-2 row-start-1 min-h-4 text-xs leading-normal";

export function ReviewSectionItem({
  check,
  showId = true,
}: {
  check: ReviewCheckItem;
  showId?: boolean;
}) {
  const display = check.displayValue ?? check.value;
  const highlighted = check.highlight === true;
  const destructive = check.risk === "destructive";
  const highlightCellClass = highlighted ? highlightClass : undefined;

  const valueClass = cn(
    "min-w-0 self-center break-all text-right [overflow-wrap:anywhere]",
    destructive && "font-medium text-destructive",
  );

  return (
    <div
      data-check-id={check.id}
      data-slot="review-section-item"
      data-highlight={highlighted ? "true" : undefined}
      className={cn(
        rowBaseClass,
        keyValueGridClass,
        showId ? "grid-rows-[auto_1fr] gap-y-2" : "grid-rows-1",
        highlightCellClass,
      )}
    >
      <Field className="contents">
        {showId && (
          <FieldDescription className={cn(idRowClass, "min-w-0")}>{check.id}</FieldDescription>
        )}
        <FieldLabel
          className={cn(
            "col-start-1 min-w-0 self-center",
            showId ? "row-start-2" : "row-start-1",
          )}
        >
          {check.label}
        </FieldLabel>
      </Field>
      <div
        className={cn(
          "col-start-2",
          showId ? "row-start-2" : "row-start-1",
          valueClass,
        )}
      >
        {display}
      </div>
    </div>
  );
}
