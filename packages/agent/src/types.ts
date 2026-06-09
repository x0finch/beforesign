import type { ParseInput, ParseResult, ViewSpec } from "@beforesign/core";
import type { DiscoveryResult } from "@beforesign/core";

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
  | { type: "assistant_spec"; spec: ViewSpec }
  | { type: "needs_input"; discovery: DiscoveryResult }
  | { type: "done"; sessionId: string }
  | { type: "error"; message: string };

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmStream = {
  streamChat(messages: LlmMessage[]): AsyncIterable<string>;
};
