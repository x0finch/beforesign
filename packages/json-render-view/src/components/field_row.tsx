import type { FieldProps } from "@beforesign/json-render-catalog";
import { Badge } from "@beforesign/ui/badge";
import { ScrollArea } from "@beforesign/ui/scroll-area";
import { Table, TableBody, TableCell, TableRow } from "@beforesign/ui/table";
import { cn } from "@beforesign/ui/utils";

export function FieldRow({ props }: { props: FieldProps }) {
  const display = props.displayValue ?? props.value;
  const highlighted = props.highlight === true;
  const destructive = props.risk === "destructive";

  const valueClass = cn(
    "text-right break-all [overflow-wrap:anywhere]",
    destructive && "font-medium text-destructive",
  );

  function renderValue(content: string) {
    if (props.kind === "hash") {
      return (
        <ScrollArea className="max-h-32">
          <div className={cn("font-mono text-xs leading-relaxed", valueClass)}>{content}</div>
        </ScrollArea>
      );
    }
    return content;
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
    renderValue(display)
  );

  return (
    <Table>
      <TableBody>
        <TableRow className={cn(highlighted && "bg-muted/50")}>
          <TableCell className="w-[40%] font-medium capitalize text-muted-foreground">
            {props.label}
          </TableCell>
          <TableCell className={cn("w-[60%]", valueClass)}>{valueContent}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
