import type { ReviewCheckItem } from "@beforesign/core";
import { Field, FieldDescription, FieldLabel } from "@beforesign/ui/field";
import { TableCell, TableRow } from "@beforesign/ui/table";
import { cn } from "@beforesign/ui/utils";

export function ReviewCheckRow({
  check,
  showId = true,
}: {
  check: ReviewCheckItem;
  showId?: boolean;
}) {
  const display = check.displayValue ?? check.value;
  const highlighted = check.highlight === true;
  const destructive = check.risk === "destructive";
  // card table forces bg-card on td; soft blue = visible focus, not warning (amber) or error (red)
  const highlightCellClass =
    highlighted && "!bg-blue-100 dark:!bg-blue-950/55";

  return (
    <TableRow
      data-check-id={check.id}
      data-highlight={highlighted ? "true" : undefined}
    >
      <TableCell className={cn("whitespace-normal", highlightCellClass)}>
        <Field>
          {showId && <FieldDescription>{check.id}</FieldDescription>}
          <FieldLabel>{check.label}</FieldLabel>
        </Field>
      </TableCell>
      <TableCell
        className={cn(
          "whitespace-normal break-all text-right",
          highlightCellClass,
          destructive && "font-medium text-destructive",
        )}
      >
        {display}
      </TableCell>
    </TableRow>
  );
}
