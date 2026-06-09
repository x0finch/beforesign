import { normalizeRawInputToJson } from "@beforesign/detect";
import * as React from "react";
import { AppHeader } from "~/components/layout/app_header.tsx";
import { useAsk } from "~/hooks/use_ask.ts";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";
import { AiComposerBottom } from "./ai_composer_bottom.tsx";
import { AiComposerTop } from "./ai_composer_top.tsx";
import { AiDiscoveryCard } from "./ai_discovery_card.tsx";
import { AiEmptyState } from "./ai_empty_state.tsx";
import { AiMessageList } from "./ai_message_list.tsx";

export function AiPage({
  locale,
  onLocaleChange,
  initialRaw,
}: {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  initialRaw?: string;
}) {
  const [raw, setRaw] = React.useState(initialRaw ?? "");
  const [selectedHit, setSelectedHit] = React.useState<string | undefined>();
  const [followUp, setFollowUp] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  const { loading, error, messages, needsDiscovery, ask, clear } = useAsk();

  const active = messages.length > 0;

  const handleFirstAsk = () => {
    const trimmed = raw.trim();
    const jsonified = normalizeRawInputToJson(trimmed);
    const effectiveRaw = jsonified ?? trimmed;
    if (jsonified && jsonified !== raw) {
      setRaw(jsonified);
    }
    void ask({
      message: effectiveRaw,
      raw: effectiveRaw,
      locale,
    });
  };

  const handleFollowUp = () => {
    const text = followUp.trim();
    if (!text) return;
    setFollowUp("");
    void ask({
      message: text,
      selectedDiscoveryHit: selectedHit,
      locale,
    });
  };

  const handleDiscoveryContinue = () => {
    void ask({
      message:
        locale === "zh"
          ? `选择链：${selectedHit ?? ""}`
          : `Selected chain: ${selectedHit ?? ""}`,
      raw: raw.trim() || undefined,
      selectedDiscoveryHit: selectedHit,
      locale,
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-6rem)]">
      <AppHeader
        locale={locale}
        onLocaleChange={onLocaleChange}
        active="ai"
        trailing={
          active ? (
            <button type="button" className="btn-ghost text-sm" onClick={() => {
              clear();
              setFollowUp("");
              setSelectedHit(undefined);
            }}>
              {t(locale, "aiNewChat")}
            </button>
          ) : null
        }
      />

      {!active && (
        <div className="space-y-4 mt-4">
          <AiComposerTop
            locale={locale}
            raw={raw}
            onRawChange={setRaw}
            loading={loading}
            onAsk={handleFirstAsk}
          />
          <AiEmptyState locale={locale} />
        </div>
      )}

      {active && (
        <>
          <div className="flex-1 flex flex-col min-h-0 mt-2">
            <AiMessageList
              locale={locale}
              messages={messages}
              listRef={listRef}
              loading={loading}
            />
            {needsDiscovery && (
              <div className="mt-4">
                <AiDiscoveryCard
                  locale={locale}
                  hits={needsDiscovery.hits}
                  selectedId={selectedHit}
                  onSelect={setSelectedHit}
                  onContinue={handleDiscoveryContinue}
                />
              </div>
            )}
          </div>
          <AiComposerBottom
            locale={locale}
            value={followUp}
            onChange={setFollowUp}
            loading={loading}
            onSend={handleFollowUp}
          />
        </>
      )}

      {error && (
        <div role="alert" className="alert-destructive mt-4">
          {error}
        </div>
      )}
    </div>
  );
}
