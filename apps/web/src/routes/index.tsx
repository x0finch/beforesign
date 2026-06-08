import { createFileRoute } from "@tanstack/react-router";
import { normalizeRawInputToJson } from "@beforesign/detect";
import * as React from "react";
import { AppHeader } from "~/components/layout/app_header.tsx";
import { ParserDiscovery } from "~/components/parser/parser_discovery.tsx";
import { ParserInput } from "~/components/parser/parser_input.tsx";
import { ParserResult } from "~/components/parser/parser_result.tsx";
import { useParse } from "~/hooks/use_parse.ts";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [locale, setLocale] = React.useState<Locale>("zh");
  const [raw, setRaw] = React.useState("");
  const [chainId, setChainId] = React.useState<number | undefined>();
  const [abi, setAbi] = React.useState("");
  const [signerAddress, setSignerAddress] = React.useState("");
  const [selectedHit, setSelectedHit] = React.useState<string | undefined>();
  const { loading, error, result, parse, clear } = useParse();

  const chainRequired =
    result?.discovery?.status === "notFound" || result?.discovery?.status === "ambiguous";

  const handleParse = () => {
    const trimmed = raw.trim();
    const jsonified = normalizeRawInputToJson(trimmed);
    const effectiveRaw = jsonified ?? trimmed;
    if (jsonified && jsonified !== raw) {
      setRaw(jsonified);
    }
    void parse({
      raw: effectiveRaw,
      chainId,
      abi: abi.trim() || undefined,
      signerAddress: signerAddress.trim() || undefined,
      selectedDiscoveryHit: selectedHit,
      locale,
    });
  };

  return (
    <div className="space-y-6">
      <AppHeader locale={locale} onLocaleChange={setLocale} />

      <ParserInput
        locale={locale}
        raw={raw}
        onRawChange={setRaw}
        chainId={chainId}
        onChainChange={setChainId}
        abi={abi}
        onAbiChange={setAbi}
        signerAddress={signerAddress}
        onSignerAddressChange={setSignerAddress}
        chainRequired={chainRequired}
        loading={loading}
        onParse={handleParse}
        onClear={() => {
          clear();
          setRaw("");
          setSelectedHit(undefined);
        }}
      />

      {!result && !loading && !error && (
        <div className="card text-center py-12 text-muted">
          <p className="font-medium text-foreground">{t(locale, "emptyTitle")}</p>
          <p className="text-sm mt-2">{t(locale, "emptyDesc")}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="alert-destructive">
          {error}
        </div>
      )}

      {result?.discovery?.status === "ambiguous" && (
        <ParserDiscovery
          locale={locale}
          hits={result.discovery.hits}
          selectedId={selectedHit}
          onSelect={setSelectedHit}
          onContinue={handleParse}
        />
      )}

      {result && result.discovery?.status !== "ambiguous" && (
        <ParserResult locale={locale} result={result} />
      )}
    </div>
  );
}
