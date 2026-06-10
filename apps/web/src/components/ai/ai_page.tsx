import { normalizeRawInputToJson } from "@beforesign/detect";
import * as React from "react";
import { AppHeader } from "~/components/layout/app_header.tsx";
import type { useAsk } from "~/hooks/use_ask.ts";
import type { Locale } from "~/lib/i18n.ts";
import { t } from "~/lib/i18n.ts";
import { AiComposerBottom } from "./ai_composer_bottom.tsx";
import { AiComposerTop } from "./ai_composer_top.tsx";
import { AiDiscoveryCard } from "./ai_discovery_card.tsx";
import { AiEmptyState } from "./ai_empty_state.tsx";
import { AiMessageList } from "./ai_message_list.tsx";

export type UseAskReturn = ReturnType<typeof useAsk>;

export function AiPage({
  locale,
  onLocaleChange,
  initialRaw,
  ask,
  onNewChat,
}: {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  initialRaw?: string;
  ask: UseAskReturn;
  onNewChat: () => void;
}) {
  const [raw, setRaw] = React.useState(initialRaw ?? "");
  const [selectedHit, setSelectedHit] = React.useState<string | undefined>();
  const [followUp, setFollowUp] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  const {
    loading,
    error,
    isHydrating,
    messages,
    needsDiscovery,
    ask: sendAsk,
    clear,
    exportContext,
    conversationId: activeConversationId,
  } = ask;
  const [exportError, setExportError] = React.useState<string | null>(null);

  const active = messages.length > 0 || isHydrating;

  const handleFirstAsk = () => {
    const trimmed = raw.trim();
    const jsonified = normalizeRawInputToJson(trimmed);
    const effectiveRaw = jsonified ?? trimmed;
    if (jsonified && jsonified !== raw) {
      setRaw(jsonified);
    }
    void sendAsk({
      message: trimmed,
      raw: effectiveRaw,
      locale,
    });
  };

  const handleFollowUp = () => {
    const text = followUp.trim();
    if (!text) return;
    setFollowUp("");
    void sendAsk({
      message: text,
      selectedDiscoveryHit: selectedHit,
      locale,
    });
  };

  const handleDiscoveryContinue = () => {
    void sendAsk({
      message:
        locale === "zh"
          ? `选择链：${selectedHit ?? ""}`
          : `Selected chain: ${selectedHit ?? ""}`,
      raw: raw.trim() || undefined,
      selectedDiscoveryHit: selectedHit,
      locale,
    });
  };

  const handleExportContext = () => {
    setExportError(null);
    void exportContext().catch((e) => {
      setExportError(e instanceof Error ? e.message : "Export failed");
    });
  };

  const handleNewChat = () => {
    clear();
    setFollowUp("");
    setSelectedHit(undefined);
    setExportError(null);
    onNewChat();
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-6rem)]">
      <AppHeader
        locale={locale}
        onLocaleChange={onLocaleChange}
        trailing={
          active ? (
            <div className="flex items-center gap-2">
              {activeConversationId ? (
                <button
                  type="button"
                  className="btn-ghost text-sm"
                  onClick={handleExportContext}
                >
                  {t(locale, "aiExportContext")}
                </button>
              ) : null}
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={handleNewChat}
              >
                {t(locale, "aiNewChat")}
              </button>
            </div>
          ) : null
        }
      />

      {isHydrating && messages.length === 0 && (
        <div className="mt-4 space-y-3 animate-pulse" aria-busy="true">
          <div className="h-10 rounded-lg bg-muted max-w-[85%]" />
          <div className="h-24 rounded-lg bg-muted max-w-full" />
        </div>
      )}

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

      {exportError && (
        <div role="alert" className="alert-destructive mt-4">
          {exportError}
        </div>
      )}
    </div>
  );
}
