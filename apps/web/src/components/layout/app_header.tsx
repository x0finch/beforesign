import type { locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";
import { ThemeToggle } from "./theme_toggle.tsx";

export function AppHeader({
  locale,
  on_locale_change,
}: {
  locale: locale;
  on_locale_change: (l: locale) => void;
}) {
  return (
    <header className="flex items-center justify-between gap-4 py-4 border-b border-border">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">BeforeSign</h1>
        <p className="text-sm text-muted">{t(locale, "tagline")}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-ghost text-sm min-h-10"
          onClick={() => on_locale_change(locale === "zh" ? "en" : "zh")}
        >
          {locale === "zh" ? "EN" : "中文"}
        </button>
        <ThemeToggle locale={locale} />
      </div>
    </header>
  );
}
