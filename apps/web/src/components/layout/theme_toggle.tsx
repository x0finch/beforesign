import { useTheme } from "next-themes";
import * as React from "react";
import type { locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function ThemeToggle({ locale }: { locale: locale }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, set_mounted] = React.useState(false);

  React.useEffect(() => set_mounted(true), []);

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
      ? t(locale, "theme_light")
      : theme === "dark"
        ? t(locale, "theme_dark")
        : t(locale, "theme_system");

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
