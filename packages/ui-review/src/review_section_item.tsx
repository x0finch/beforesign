"use client";

import type { ReviewCheckItem } from "@beforesign/core";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@beforesign/ui/tooltip";
import { cn } from "@beforesign/ui/utils";

const rowBaseClass = cn(
  "rounded-lg px-3 py-2.5 transition-colors",
  "hover:bg-black/5 dark:hover:bg-white/10",
);

const highlightClass = cn(
  "rounded-lg bg-blue-100 px-3 py-2.5 transition-colors",
  "dark:bg-blue-950/55",
  "hover:bg-blue-200 dark:hover:bg-blue-900/60",
);

const keyValueGridClass =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 whitespace-normal min-h-[3.875rem]";

const labelClass =
  "inline-flex font-medium text-base/4.5 text-foreground sm:text-sm/4";

function CheckLabel({ check, showId }: { check: ReviewCheckItem; showId: boolean }) {
  if (!showId) {
    return <span className={labelClass}>{check.label}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn(labelClass, "w-fit cursor-default")} />}>
        {check.label}
      </TooltipTrigger>
      <TooltipPopup className="font-mono">{check.id}</TooltipPopup>
    </Tooltip>
  );
}

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
        keyValueGridClass,
        highlighted ? highlightClass : rowBaseClass,
      )}
    >
      <div className="col-start-1 flex min-w-0 flex-col gap-1 self-center">
        <CheckLabel check={check} showId={showId} />
        {check.description && (
          <p className="text-muted-foreground text-xs leading-normal">{check.description}</p>
        )}
      </div>
      <div className={cn("col-start-2", valueClass)}>{display}</div>
    </div>
  );
}
