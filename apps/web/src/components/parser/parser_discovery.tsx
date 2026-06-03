import type { DiscoveryHit } from "@beforesign/core";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function ParserDiscovery({
  locale,
  hits,
  selectedId,
  onSelect,
  onContinue,
}: {
  locale: Locale;
  hits: DiscoveryHit[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="card space-y-3">
      <p className="text-sm font-medium">{t(locale, "selectHit")}</p>
      <ul className="space-y-2">
        {hits.map((hit) => (
          <li key={hit.id}>
            <label className="flex gap-3 items-start cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30">
              <input
                type="radio"
                name="discovery"
                checked={selectedId === hit.id}
                onChange={() => onSelect(hit.id)}
              />
              <span className="text-sm">
                <strong>{hit.chainName}</strong>
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
      <button type="button" className="btn-primary" disabled={!selectedId} onClick={onContinue}>
        {t(locale, "continueParse")}
      </button>
    </div>
  );
}
