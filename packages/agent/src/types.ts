import type { ParseInput, ParseResult, ViewSpec } from "@beforesign/core";
import type { DiscoveryResult } from "@beforesign/core";
import type { Session } from "@openai/agents";
import type { AgentContextExport } from "./export_agent_context.ts";
import type { NormalizedAskInput } from "./normalize_ask_input.ts";

export type AskLocale = "zh" | "en";

export type AskInput = {
  sessionId?: string;
  message: string;
  raw?: string;
  chainId?: number;
  abi?: string;
  signerAddress?: string;
  selectedDiscoveryHit?: string;
  locale: AskLocale;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "status";
  content: string;
  spec?: ViewSpec;
  createdAt: number;
};

export type AskSession = {
  id: string;
  messages: ChatMessage[];
  parseResult?: ParseResult;
  lastParseInput?: ParseInput;
  agentMemory?: Session;
  /** OpenAI Conversations API id (`conv_*`), distinct from client `session.id` UUID. */
  openaiConversationId?: string;
  lastNormalizedInput?: NormalizedAskInput;
  lastContextExport?: AgentContextExport;
  createdAt: number;
  updatedAt: number;
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
  | { type: "done"; sessionId: string }
  | { type: "context_export"; export: AgentContextExport }
  | { type: "error"; message: string };

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmStream = {
  streamChat(messages: LlmMessage[]): AsyncIterable<string>;
};
