import type { FieldProps } from "@beforesign/json-render-catalog";
import { Badge } from "@beforesign/ui/badge";
import { cn } from "@beforesign/ui/utils";

export function FieldRow({ props }: { props: FieldProps }) {
  const display = props.displayValue ?? props.value;
  const highlighted = props.highlight === true;
  const destructive = props.risk === "destructive";

  function renderPlainValue(content: string) {
    return (
      <div
        className={cn(
          "break-all [overflow-wrap:anywhere]",
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
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {props.href ? (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("min-w-0 break-all hover:underline", destructive && "text-destructive")}
        >
          {display}
        </a>
      ) : (
        <span className="min-w-0 break-all">{display}</span>
      )}
      {props.badge && props.badgeVariant ? (
        <Badge variant={props.badgeVariant} size="sm" className="shrink-0">
          {props.badge}
        </Badge>
      ) : null}
    </div>
  ) : (
    renderPlainValue(display)
  );

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(6.5rem,30%)_minmax(0,1fr)] items-start gap-x-3",
        highlighted && "rounded-md bg-muted/50",
      )}
    >
      <div className="py-2.5 font-medium capitalize text-muted-foreground">{props.label}</div>
      <div className="min-w-0 py-2.5 whitespace-normal">{valueContent}</div>
    </div>
  );
}
