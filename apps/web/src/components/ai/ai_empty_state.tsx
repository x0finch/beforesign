import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function AiEmptyState({ locale }: { locale: Locale }) {
  return (
    <div className="text-center py-8 text-muted">
      <p className="font-medium text-foreground">{t(locale, "aiEmptyTitle")}</p>
      <p className="text-sm mt-2">{t(locale, "aiEmptyDesc")}</p>
    </div>
  );
}
