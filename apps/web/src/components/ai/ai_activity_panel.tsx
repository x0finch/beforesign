import { Frame, FramePanel } from "@beforesign/ui/frame";
import { Spinner } from "@beforesign/ui/spinner";
import { cn } from "@beforesign/ui/utils";
import type { AgentStep } from "~/hooks/use_ask.ts";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function StepIcon({ status }: { status: AgentStep["status"] }) {
  if (status === "running") {
    return <Spinner className="size-3.5 shrink-0 text-muted-foreground" />;
  }
  if (status === "error") {
    return <AlertIcon className="text-destructive" />;
  }
  return <CheckIcon className="text-muted-foreground" />;
}

export function AiActivityPanel({
  locale,
  steps,
  collapsed,
  onToggle,
}: {
  locale: Locale;
  steps: AgentStep[];
  collapsed: boolean;
  onToggle: () => void;
}) {
  const isActive = steps.some((step) => step.status === "running");
  const doneCount = steps.filter((step) => step.status === "done").length;
  const summary = t(locale, "aiActivityDone").replace("{count}", String(doneCount));

  if (collapsed && !isActive) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full max-w-[95%] items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted/50"
      >
        <CheckIcon />
        <span className="flex-1">
          {summary} · {t(locale, "aiActivityExpand")}
        </span>
        <ChevronDownIcon className="size-3.5 shrink-0" />
      </button>
    );
  }

  return (
    <Frame className="max-w-[95%] rounded-xl p-0.5">
      <FramePanel className="p-3 shadow-none">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{summary}</p>
          {!isActive && (
            <button
              type="button"
              onClick={onToggle}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t(locale, "aiActivityCollapse")}
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {steps.map((step) => (
            <li key={step.key} className="flex items-start gap-2">
              <StepIcon status={step.status} />
              <span
                className={cn(
                  "text-xs leading-relaxed",
                  step.status === "error" && "text-destructive",
                  step.status === "running" && "text-foreground",
                  step.status === "done" && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </FramePanel>
    </Frame>
  );
}
