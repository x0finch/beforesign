import type { ParseResult } from "@beforesign/core";
import { getChainById } from "@beforesign/core";
import type { Locale } from "~/lib/i18n.ts";
import { displaySummary, kindLabel } from "~/lib/format_display.ts";

export function ParserStatusBar({
  locale,
  result,
}: {
  locale: Locale;
  result: ParseResult;
}) {
  const chainId = result.view?.chainId;
  const chain = chainId ? getChainById(chainId) : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="badge">{kindLabel(locale, result.kind)}</span>
      {chain && (
        <span className="badge-muted">{locale === "zh" ? chain.name : chain.nameEn}</span>
      )}
      <p className="text-sm w-full">{displaySummary(result, locale)}</p>
    </div>
  );
}
