import type { AgentInputItem } from "@openai/agents";
import { describe, expect, it } from "vitest";
import { loadConversationEntries } from "../src/load_conversation.ts";
import { createEmptySession } from "../src/session_state.ts";

describe("loadConversationEntries", () => {
  it("returns items from attached agent memory", async () => {
    const items: AgentInputItem[] = [
      { type: "message", role: "user", content: "hello" },
    ];
    const session = createEmptySession("conv_abc");
    session.agentMemory = {
      getItems: async () => items,
    } as never;

    const loaded = await loadConversationEntries(session, {
      apiKey: "test-key",
      model: "gpt-4o-mini",
    });

    expect(loaded).toEqual(items);
  });
});
