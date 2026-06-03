import * as React from "react";
import { CHAINS } from "@beforesign/core";
import type { locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function ParserInput({
  locale,
  raw,
  on_raw_change,
  chain_id,
  on_chain_change,
  abi,
  on_abi_change,
  chain_required,
  loading,
  on_parse,
  on_clear,
}: {
  locale: locale;
  raw: string;
  on_raw_change: (v: string) => void;
  chain_id?: number;
  on_chain_change: (id: number | undefined) => void;
  abi: string;
  on_abi_change: (v: string) => void;
  chain_required?: boolean;
  loading: boolean;
  on_parse: () => void;
  on_clear: () => void;
}) {
  const handle_key = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      on_parse();
    }
  };

  return (
    <section className="card space-y-4">
      <label className="block">
        <textarea
          className="input-area font-mono text-sm min-h-[140px]"
          value={raw}
          onChange={(e) => on_raw_change(e.target.value)}
          onKeyDown={handle_key}
          placeholder={t(locale, "placeholder")}
          aria-label="raw input"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="select min-h-10"
          value={chain_id ?? ""}
          onChange={(e) =>
            on_chain_change(e.target.value ? Number(e.target.value) : undefined)
          }
          aria-required={chain_required}
        >
          <option value="">
            {chain_required ? t(locale, "chain_required") : t(locale, "chain_optional")}
          </option>
          {CHAINS.map((c) => (
            <option key={c.chain_id} value={c.chain_id}>
              {locale === "zh" ? c.name : c.name_en}
            </option>
          ))}
        </select>
        <button type="button" className="btn-primary min-h-10" disabled={loading || !raw.trim()} onClick={on_parse}>
          {loading ? t(locale, "parsing") : t(locale, "parse")}
        </button>
        <button type="button" className="btn-ghost min-h-10" onClick={on_clear}>
          {t(locale, "clear")}
        </button>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">{t(locale, "advanced_abi")}</summary>
        <textarea
          className="input-area font-mono text-xs mt-2 min-h-[80px]"
          value={abi}
          onChange={(e) => on_abi_change(e.target.value)}
        />
      </details>
    </section>
  );
}
