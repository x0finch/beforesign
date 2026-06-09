import * as React from "react";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function AiComposerBottom({
  locale,
  value,
  onChange,
  loading,
  onSend,
}: {
  locale: Locale;
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  onSend: () => void;
}) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 -mx-4 px-4 py-3 border-t border-border bg-background/95 backdrop-blur">
      <div className="flex gap-2 items-end max-w-3xl mx-auto">
        <textarea
          className="input-area text-sm min-h-[44px] max-h-32 flex-1 resize-y"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t(locale, "aiFollowUp")}
          aria-label="follow-up"
          rows={1}
        />
        <button
          type="button"
          className="btn-primary min-h-10 shrink-0"
          disabled={loading || !value.trim()}
          onClick={onSend}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
