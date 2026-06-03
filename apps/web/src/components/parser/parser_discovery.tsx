import type { discovery_hit } from "@beforesign/core";
import type { locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function ParserDiscovery({
  locale,
  hits,
  selected_id,
  on_select,
  on_continue,
}: {
  locale: locale;
  hits: discovery_hit[];
  selected_id?: string;
  on_select: (id: string) => void;
  on_continue: () => void;
}) {
  return (
    <div className="card space-y-3">
      <p className="text-sm font-medium">{t(locale, "select_hit")}</p>
      <ul className="space-y-2">
        {hits.map((hit) => (
          <li key={hit.id}>
            <label className="flex gap-3 items-start cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30">
              <input
                type="radio"
                name="discovery"
                checked={selected_id === hit.id}
                onChange={() => on_select(hit.id)}
              />
              <span className="text-sm">
                <strong>{hit.chain_name}</strong>
                {hit.from && (
                  <span className="block font-mono text-xs text-muted truncate">
                    {hit.from} → {hit.to ?? "?"}
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-primary" disabled={!selected_id} onClick={on_continue}>
        {t(locale, "continue_parse")}
      </button>
    </div>
  );
}
