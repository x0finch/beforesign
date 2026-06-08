import * as React from "react";
import { CHAINS } from "@beforesign/core";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export function ParserInput({
  locale,
  raw,
  onRawChange,
  chainId,
  onChainChange,
  abi,
  onAbiChange,
  signerAddress,
  onSignerAddressChange,
  chainRequired,
  loading,
  onParse,
  onClear,
}: {
  locale: Locale;
  raw: string;
  onRawChange: (v: string) => void;
  chainId?: number;
  onChainChange: (id: number | undefined) => void;
  abi: string;
  onAbiChange: (v: string) => void;
  signerAddress: string;
  onSignerAddressChange: (v: string) => void;
  chainRequired?: boolean;
  loading: boolean;
  onParse: () => void;
  onClear: () => void;
}) {
  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onParse();
    }
  };

  return (
    <section className="card space-y-4">
      <label className="block">
        <textarea
          className="input-area font-mono text-sm min-h-[140px]"
          value={raw}
          onChange={(e) => onRawChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t(locale, "placeholder")}
          aria-label="raw input"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="select min-h-10"
          value={chainId ?? ""}
          onChange={(e) =>
            onChainChange(e.target.value ? Number(e.target.value) : undefined)
          }
          aria-required={chainRequired}
        >
          <option value="">
            {chainRequired ? t(locale, "chainRequired") : t(locale, "chainOptional")}
          </option>
          {CHAINS.map((c) => (
            <option key={c.chainId} value={c.chainId}>
              {locale === "zh" ? c.name : c.nameEn}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-primary min-h-10"
          disabled={loading || !raw.trim()}
          onClick={onParse}
        >
          {loading ? t(locale, "parsing") : t(locale, "parse")}
        </button>
        <button type="button" className="btn-ghost min-h-10" onClick={onClear}>
          {t(locale, "clear")}
        </button>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">{t(locale, "advancedAbi")}</summary>
        <div className="mt-2 space-y-3">
          <label className="block">
            <span className="text-muted text-xs">{t(locale, "signerAddress")}</span>
            <input
              className="input-area font-mono text-xs mt-1"
              value={signerAddress}
              onChange={(e) => onSignerAddressChange(e.target.value)}
              placeholder={t(locale, "signerPlaceholder")}
            />
          </label>
          <textarea
            className="input-area font-mono text-xs min-h-[80px]"
            value={abi}
            onChange={(e) => onAbiChange(e.target.value)}
          />
        </div>
      </details>
    </section>
  );
}
