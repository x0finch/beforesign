import type { ParseResult, ViewSpec } from "@beforesign/core";
import type { DiscoveryResult } from "@beforesign/core";
import type { Session } from "@openai/agents";
import type { AgentContextExport } from "./export_agent_context.ts";

export type AskLocale = "zh" | "en";

export type AskInput = {
  conversationId?: string;
  message: string;
  raw?: string;
  chainId?: number;
  abi?: string;
  signerAddress?: string;
  selectedDiscoveryHit?: string;
  locale: AskLocale;
};

export type AskSession = {
  /** OpenAI Conversations id (`conv_*`); empty until first turn syncs. */
  id: string;
  agentMemory?: Session;
};

export type TimelineEntry =
  | { kind: "thought"; text: string }
  | {
      kind: "tool";
      name: string;
      status: "running" | "done" | "error";
      summary?: string;
    };

export type AskSseEvent =
  | { type: "status"; phase: "detecting" | "building_view" | "thinking" }
  | { type: "timeline"; entry: TimelineEntry }
  | { type: "tool"; name: string }
  | { type: "parse_result"; result: ParseResult }
  | { type: "delta"; text: string }
  | { type: "assistant_text"; content: string }
  | { type: "assistant_spec"; spec: ViewSpec }
  | { type: "needs_input"; discovery: DiscoveryResult }
  | { type: "done"; conversationId: string }
  | { type: "context_export"; export: AgentContextExport }
  | { type: "error"; message: string };

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmStream = {
  streamChat(messages: LlmMessage[]): AsyncIterable<string>;
};
