import { describe, expect, it } from "vitest";
import {
  extractLatestSpecFromConversation,
  parseResultFromSpec,
} from "../src/conversation_spec.ts";
import type { ConversationEntry } from "../src/export_agent_context.ts";

const SPEC = {
  root: "root",
  elements: { root: { type: "Text", props: { content: "hello" } } },
};

describe("extractLatestSpecFromConversation", () => {
  it("returns the latest parse tool spec from conversation export", () => {
    const conversation: ConversationEntry[] = [
      {
        role: "tool",
        name: "build_view",
        output: JSON.stringify({ spec: { root: "old", elements: {} } }),
      },
      {
        role: "tool",
        name: "parse_calldata",
        output: JSON.stringify({ spec: SPEC }),
      },
    ];

    expect(extractLatestSpecFromConversation(conversation)).toEqual(SPEC);
  });
});

describe("parseResultFromSpec", () => {
  it("wraps spec in a minimal ParseResult for UI rendering", () => {
    const result = parseResultFromSpec(SPEC);
    expect(result.view?.spec).toEqual(SPEC);
  });
});
