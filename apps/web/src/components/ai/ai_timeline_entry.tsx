import { Spinner } from "@beforesign/ui/spinner";
import { cn } from "@beforesign/ui/utils";
import type { TimelineEntry } from "~/hooks/use_ask.ts";
import type { Locale } from "~/lib/i18n.ts";

function formatToolLabel(
  name: string,
  locale: Locale,
  status: "running" | "done" | "error",
): string {
  if (locale === "zh") {
    if (status === "running") return `正在调用 ${name}…`;
    if (status === "error") return `${name} 失败`;
    return `${name} 完成`;
  }
  if (status === "running") return `Running ${name}…`;
  if (status === "error") return `${name} failed`;
  return `${name} done`;
}

export function AiTimelineEntry({
  locale,
  entry,
  active,
}: {
  locale: Locale;
  entry: TimelineEntry;
  active?: boolean;
}) {
  if (entry.kind === "thought") {
    return (
      <p
        className={cn(
          "text-xs leading-relaxed",
          active ? "text-muted-foreground" : "text-muted-foreground/50",
        )}
      >
        {active && (
          <Spinner className="inline size-3 mr-1.5 align-[-2px] text-muted-foreground" />
        )}
        {entry.text}
      </p>
    );
  }

  const label = formatToolLabel(entry.name, locale, entry.status);
  const detail = entry.summary ? ` → ${entry.summary}` : "";

  return (
    <p
      className={cn(
        "text-xs leading-relaxed font-mono",
        entry.status === "running" && "text-muted-foreground",
        entry.status === "done" && "text-muted-foreground/50",
        entry.status === "error" && "text-destructive/80",
      )}
    >
      {entry.status === "running" && (
        <Spinner className="inline size-3 mr-1.5 align-[-2px] text-muted-foreground" />
      )}
      {label}
      {detail}
    </p>
  );
}
