import type { FieldProps } from "@beforesign/json-render-catalog";
import { Badge } from "@beforesign/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@beforesign/ui/table";
import { cn } from "@beforesign/ui/utils";

export function FieldRow({ props }: { props: FieldProps }) {
  const display = props.displayValue ?? props.value;
  const highlighted = props.highlight === true;
  const destructive = props.risk === "destructive";

  function renderPlainValue(content: string) {
    return (
      <div
        className={cn(
          "text-right break-all [overflow-wrap:anywhere]",
          props.clamp === true && "max-h-32 overflow-y-auto overflow-x-hidden",
          props.mono === true && "font-mono text-xs leading-relaxed",
          destructive && "font-medium text-destructive",
        )}
      >
        {content}
      </div>
    );
  }

  const hasRichValue = props.href !== null || props.badge !== null;

  const valueContent = hasRichValue ? (
    <div className="flex min-w-0 items-center justify-end gap-2">
      {props.href ? (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("min-w-0 truncate hover:underline", destructive && "text-destructive")}
        >
          {display}
        </a>
      ) : (
        <span className="min-w-0 truncate">{display}</span>
      )}
      {props.badge && props.badgeVariant ? (
        <Badge variant={props.badgeVariant} size="sm">
          {props.badge}
        </Badge>
      ) : null}
    </div>
  ) : (
    renderPlainValue(display)
  );

  return (
    <Table className="table-fixed">
      <TableBody>
        <TableRow className={cn(highlighted && "bg-muted/50")}>
          <TableCell className="w-[40%] align-top font-medium capitalize text-muted-foreground">
            {props.label}
          </TableCell>
          <TableCell className="w-[60%] min-w-0 align-top whitespace-normal">
            {valueContent}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
