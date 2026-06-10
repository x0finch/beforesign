import type { ParseResult, ViewSpec } from "@beforesign/core";
import type { DiscoveryResult } from "@beforesign/core";
import {
  extractLatestSpecFromConversation,
  parseResultFromSpec,
  type AgentContextExport,
} from "@beforesign/agent";
import * as React from "react";
import type { ConversationHydration } from "~/types/conversation.ts";
import {
  hydrateConversationToMessages,
  inferLastRawFromConversation,
} from "~/lib/hydrate_conversation.ts";
import type { Locale } from "~/lib/i18n.ts";

export type AskPhase = "idle" | "detecting" | "building_view" | "thinking";

export type TimelineEntry =
  | { kind: "thought"; text: string }
  | {
      kind: "tool";
      name: string;
      status: "running" | "done" | "error";
      summary?: string;
    };

export type AskMessage =
  | { id: string; kind: "user"; content: string }
  | { id: string; kind: "assistant"; spec: ViewSpec }
  | { id: string; kind: "assistant_text"; content: string }
  | { id: string; kind: "timeline"; entry: TimelineEntry }
  | { id: string; kind: "artifact"; result: ParseResult };

export type UseAskInput = {
  message: string;
  raw?: string;
  chainId?: number;
  abi?: string;
  signerAddress?: string;
  selectedDiscoveryHit?: string;
  locale: Locale;
};

export type UseAskOptions = {
  conversationId?: string;
  hydration?: ConversationHydration;
  isHydrating?: boolean;
  onConversationId?: (conversationId: string) => void;
  locale: Locale;
};

export function downloadAgentContextExport(exportData: AgentContextExport) {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `agent-context-${exportData.conversationId}-${exportData.exportedAt.replace(/[:.]/g, "-")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useAsk({
  conversationId,
  hydration,
  isHydrating = false,
  onConversationId,
  locale,
}: UseAskOptions) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [contextExport, setContextExport] = React.useState<AgentContextExport | null>(
    null,
  );
  const [messages, setMessages] = React.useState<AskMessage[]>([]);
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(null);
  const [needsDiscovery, setNeedsDiscovery] = React.useState<DiscoveryResult | null>(
    null,
  );
  const [phase, setPhase] = React.useState<AskPhase>("idle");
  const abortRef = React.useRef<AbortController | null>(null);
  const lastRawRef = React.useRef<string | undefined>(undefined);
  const [knownConversationId, setKnownConversationId] = React.useState<
    string | undefined
  >(conversationId);
  const seededHydrationRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (conversationId) {
      setKnownConversationId(conversationId);
    }
  }, [conversationId]);

  React.useEffect(() => {
    if (!hydration) return;
    if (messages.length > 0) return;
    if (seededHydrationRef.current === hydration.conversationId) return;

    const hydratedMessages = hydrateConversationToMessages(hydration.conversation);
    if (hydratedMessages.length > 0) {
      setMessages(hydratedMessages);
    }

    const spec = extractLatestSpecFromConversation(hydration.conversation);
    if (spec) {
      setParseResult(parseResultFromSpec(spec));
    }

    const inferredRaw = inferLastRawFromConversation(hydration.conversation);
    if (inferredRaw) {
      lastRawRef.current = inferredRaw;
    }

    seededHydrationRef.current = hydration.conversationId;
  }, [hydration, messages.length]);

  const activeConversationId = conversationId ?? knownConversationId;

  const clear = React.useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setError(null);
    setContextExport(null);
    setMessages([]);
    setParseResult(null);
    setNeedsDiscovery(null);
    setPhase("idle");
    lastRawRef.current = undefined;
    setKnownConversationId(undefined);
    seededHydrationRef.current = undefined;
  }, []);

  const ensureConversationId = React.useCallback(async (): Promise<string> => {
    if (activeConversationId) return activeConversationId;

    const response = await fetch("/api/ai/conversation", { method: "POST" });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Failed to create conversation (${response.status})`);
    }

    const data = (await response.json()) as { conversationId?: string };
    if (!data.conversationId) {
      throw new Error("Missing conversationId in create response");
    }

    setKnownConversationId(data.conversationId);
    onConversationId?.(data.conversationId);
    return data.conversationId;
  }, [activeConversationId, onConversationId]);

  const ask = React.useCallback(async (input: UseAskInput) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setNeedsDiscovery(null);
    setPhase("detecting");

    let requestConversationId: string;
    try {
      requestConversationId = await ensureConversationId();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create conversation");
      setLoading(false);
      setPhase("idle");
      return;
    }

    const trimmedRaw = input.raw?.trim();
    if (trimmedRaw) {
      lastRawRef.current = trimmedRaw;
    }
    const effectiveRaw = trimmedRaw ?? lastRawRef.current;

    const userId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: userId, kind: "user", content: input.message },
    ]);

    let lastTimelineId: string | null = null;

    const appendTimeline = (entry: TimelineEntry) => {
      const id = crypto.randomUUID();
      lastTimelineId = id;
      setMessages((prev) => [...prev, { id, kind: "timeline", entry }]);
    };

    const patchLastTimeline = (entry: TimelineEntry) => {
      const targetId = lastTimelineId;
      if (!targetId) {
        appendTimeline(entry);
        return;
      }
      setMessages((prev) =>
        prev.map((message) =>
          message.id === targetId && message.kind === "timeline"
            ? { ...message, entry }
            : message,
        ),
      );
    };

    try {
      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversationId: requestConversationId,
          message: input.message,
          raw: effectiveRaw,
          chainId: input.chainId,
          abi: input.abi,
          signerAddress: input.signerAddress,
          selectedDiscoveryHit: input.selectedDiscoveryHit,
          locale: input.locale,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const json = line.slice(5).trim();
          if (!json) continue;

          const event = JSON.parse(json) as {
            type: string;
            phase?: AskPhase;
            entry?: TimelineEntry;
            result?: ParseResult;
            discovery?: DiscoveryResult;
            conversationId?: string;
            message?: string;
            spec?: ViewSpec;
            content?: string;
            export?: AgentContextExport;
          };

          switch (event.type) {
            case "status":
              if (event.phase) setPhase(event.phase);
              break;
            case "timeline":
              if (event.entry) {
                if (event.entry.kind === "tool" && event.entry.status === "done") {
                  patchLastTimeline(event.entry);
                  lastTimelineId = null;
                } else if (event.entry.kind === "tool" && event.entry.status === "error") {
                  patchLastTimeline(event.entry);
                  lastTimelineId = null;
                } else if (event.entry.kind === "tool" && event.entry.status === "running") {
                  appendTimeline(event.entry);
                } else {
                  lastTimelineId = null;
                  appendTimeline(event.entry);
                }
              }
              break;
            case "parse_result":
              if (event.result) {
                setParseResult(event.result);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    kind: "artifact",
                    result: event.result!,
                  },
                ]);
              }
              break;
            case "needs_input":
              if (event.discovery) setNeedsDiscovery(event.discovery);
              break;
            case "assistant_spec":
              if (event.spec) {
                setMessages((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), kind: "assistant", spec: event.spec! },
                ]);
              }
              break;
            case "assistant_text":
              if (event.content) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    kind: "assistant_text",
                    content: event.content!,
                  },
                ]);
              }
              break;
            case "context_export":
              if (event.export) {
                setContextExport(event.export);
                const spec = extractLatestSpecFromConversation(
                  event.export.conversation,
                );
                if (spec) {
                  setParseResult(parseResultFromSpec(spec));
                }
              }
              break;
            case "done":
              if (event.conversationId) {
                setKnownConversationId(event.conversationId);
              }
              break;
            case "error":
              throw new Error(event.message ?? "Ask failed");
          }
        }
      }
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Ask failed");
    } finally {
      setLoading(false);
      setPhase("idle");
    }
  }, [ensureConversationId]);

  const exportContext = React.useCallback(async () => {
    if (contextExport) {
      downloadAgentContextExport(contextExport);
      return;
    }
    if (!activeConversationId) return;

    const params = new URLSearchParams({
      conversationId: activeConversationId,
      locale,
    });
    const response = await fetch(`/api/ai/context?${params.toString()}`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Export failed (${response.status})`);
    }
    const exportData = (await response.json()) as AgentContextExport;
    setContextExport(exportData);
    downloadAgentContextExport(exportData);
  }, [contextExport, activeConversationId, locale]);

  return {
    loading,
    error,
    isHydrating,
    conversationId: activeConversationId,
    contextExport,
    messages,
    parseResult,
    needsDiscovery,
    phase,
    ask,
    clear,
    exportContext,
  };
}
