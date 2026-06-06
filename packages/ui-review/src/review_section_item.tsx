"use client";

import type { ReviewCheckItem } from "@beforesign/core";
import { Badge } from "@beforesign/ui/badge";
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
  "inline-flex font-medium capitalize text-base/4.5 text-foreground sm:text-sm/4";

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

  const hasRichValue = check.href !== undefined || check.badge !== undefined;

  const valueContent = hasRichValue ? (
    <div className="flex min-w-0 items-center justify-end gap-2">
      {check.href ? (
        <a
          href={check.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("min-w-0 truncate hover:underline", destructive && "text-destructive")}
        >
          {display}
        </a>
      ) : (
        <span className="min-w-0 truncate">{display}</span>
      )}
      {check.badge && check.badgeVariant ? (
        <Badge variant={check.badgeVariant} size="sm">
          {check.badge}
        </Badge>
      ) : null}
    </div>
  ) : (
    display
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
      <div className={cn("col-start-2", valueClass)}>{valueContent}</div>
    </div>
  );
}
