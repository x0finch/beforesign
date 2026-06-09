import type { ParseResult, ViewSpec } from "@beforesign/core";
import type { ConversationEntry } from "./export_agent_context.ts";

const PARSE_TOOL_NAMES = new Set(["build_view", "parse_calldata"]);

export function extractLatestSpecFromConversation(
  conversation: ConversationEntry[],
): ViewSpec | undefined {
  for (let i = conversation.length - 1; i >= 0; i -= 1) {
    const entry = conversation[i];
    if (!entry || entry.role !== "tool") continue;
    if (!PARSE_TOOL_NAMES.has(entry.name)) continue;
    if (!entry.output) continue;

    try {
      const parsed = JSON.parse(entry.output) as { spec?: ViewSpec };
      if (parsed.spec) return parsed.spec;
    } catch {
      continue;
    }
  }
  return undefined;
}

export function parseResultFromSpec(spec: ViewSpec): ParseResult {
  return {
    kind: "unknown",
    summary: "",
    warnings: [],
    raw: null,
    view: {
      title: "",
      summary: "",
      spec,
    },
  };
}
