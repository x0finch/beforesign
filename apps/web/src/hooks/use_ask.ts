import type { ParseResult, ViewSpec } from "@beforesign/core";
import type { DiscoveryResult } from "@beforesign/core";
import * as React from "react";
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

export function useAsk() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string | undefined>();
  const [messages, setMessages] = React.useState<AskMessage[]>([]);
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(null);
  const [needsDiscovery, setNeedsDiscovery] = React.useState<DiscoveryResult | null>(
    null,
  );
  const [phase, setPhase] = React.useState<AskPhase>("idle");
  const abortRef = React.useRef<AbortController | null>(null);

  const clear = React.useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setError(null);
    setSessionId(undefined);
    setMessages([]);
    setParseResult(null);
    setNeedsDiscovery(null);
    setPhase("idle");
  }, []);

  const ask = React.useCallback(async (input: UseAskInput) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setNeedsDiscovery(null);
    setPhase("detecting");

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
          sessionId,
          message: input.message,
          raw: input.raw,
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
            sessionId?: string;
            message?: string;
            spec?: ViewSpec;
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
            case "done":
              if (event.sessionId) setSessionId(event.sessionId);
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
  }, [sessionId]);

  return {
    loading,
    error,
    sessionId,
    messages,
    parseResult,
    needsDiscovery,
    phase,
    ask,
    clear,
  };
}
