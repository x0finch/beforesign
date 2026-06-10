import type { ConversationEntry } from "@beforesign/agent";
import { parseResultFromSpec } from "@beforesign/agent";
import type { ViewSpec } from "@beforesign/core";
import type { AskMessage } from "~/hooks/use_ask.ts";

const PARSE_TOOL_NAMES = new Set(["build_view", "parse_calldata"]);

function newId(): string {
  return crypto.randomUUID();
}

export function hydrateConversationToMessages(
  conversation: ConversationEntry[],
): AskMessage[] {
  const messages: AskMessage[] = [];

  for (const entry of conversation) {
    if (entry.role === "system") continue;

    if (entry.role === "user") {
      messages.push({ id: newId(), kind: "user", content: entry.content });
      continue;
    }

    if (entry.role === "assistant") {
      messages.push({ id: newId(), kind: "assistant_text", content: entry.content });
      continue;
    }

    if (entry.role === "tool") {
      if (PARSE_TOOL_NAMES.has(entry.name) && entry.output) {
        try {
          const parsed = JSON.parse(entry.output) as { spec?: ViewSpec };
          if (parsed.spec) {
            messages.push({
              id: newId(),
              kind: "artifact",
              result: parseResultFromSpec(parsed.spec),
            });
            continue;
          }
        } catch {
          // fall through to timeline
        }
      }

      messages.push({
        id: newId(),
        kind: "timeline",
        entry: {
          kind: "tool",
          name: entry.name,
          status: "done",
          summary: entry.output?.slice(0, 120) ?? entry.name,
        },
      });
    }
  }

  return messages;
}

export function inferLastRawFromConversation(
  conversation: ConversationEntry[],
): string | undefined {
  for (let i = conversation.length - 1; i >= 0; i -= 1) {
    const entry = conversation[i];
    if (entry?.role !== "user") continue;
    const content = entry.content.trim();
    if (content.startsWith("0x") || content.startsWith("{")) {
      return content;
    }
  }
  return undefined;
}
