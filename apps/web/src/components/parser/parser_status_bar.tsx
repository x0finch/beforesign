import type { parse_result } from "@beforesign/core";
import { get_chain_by_id } from "@beforesign/core";
import type { locale } from "~/lib/i18n.ts";
import { display_summary, kind_label } from "~/lib/format_display.ts";

export function ParserStatusBar({
  locale,
  result,
}: {
  locale: locale;
  result: parse_result;
}) {
  const chain_id = result.tx?.chain_id ?? result.onchain?.chain_id ?? result.discovery?.resolved_chain_id;
  const chain = chain_id ? get_chain_by_id(chain_id) : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="badge">{kind_label(locale, result.kind)}</span>
      {chain && (
        <span className="badge-muted">
          {locale === "zh" ? chain.name : chain.name_en}
        </span>
      )}
      <p className="text-sm w-full">{display_summary(result, locale)}</p>
    </div>
  );
}
