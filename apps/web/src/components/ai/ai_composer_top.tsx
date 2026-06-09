import * as React from "react";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function AiComposerTop({
  locale,
  raw,
  onRawChange,
  loading,
  onAsk,
}: {
  locale: Locale;
  raw: string;
  onRawChange: (v: string) => void;
  loading: boolean;
  onAsk: () => void;
}) {
  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onAsk();
    }
  };

  return (
    <div className="card space-y-4">
      <textarea
        className="input-area font-mono text-sm min-h-[160px]"
        value={raw}
        onChange={(e) => onRawChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={t(locale, "placeholder")}
        aria-label="ai raw input"
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary min-h-10"
          disabled={loading || !raw.trim()}
          onClick={onAsk}
        >
          {loading ? t(locale, "aiThinking") : t(locale, "aiAsk")}
        </button>
      </div>
    </div>
  );
}
