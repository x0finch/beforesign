import { useTheme } from "next-themes";
import * as React from "react";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function ThemeToggle({ locale }: { locale: Locale }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button type="button" className="btn-ghost text-sm" aria-label="theme">
        …
      </button>
    );
  }

  const cycle = () => {
    const order = ["system", "light", "dark"] as const;
    const idx = order.indexOf((theme ?? "system") as (typeof order)[number]);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
  };

  const label =
    theme === "light"
      ? t(locale, "themeLight")
      : theme === "dark"
        ? t(locale, "themeDark")
        : t(locale, "themeSystem");

  return (
    <button
      type="button"
      className="btn-ghost text-sm min-h-10"
      onClick={cycle}
      aria-label={`Theme: ${resolvedTheme ?? theme}`}
    >
      {label}
    </button>
  );
}
