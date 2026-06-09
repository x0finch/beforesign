import { describe, expect, it } from "vitest";
import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import { runAgentLoop } from "../src/agent_loop.ts";
import { createEmptySession } from "../src/session_state.ts";
import type { LlmMessage, LlmStream } from "../src/types.ts";

function mockLlm(replies: string[]): LlmStream {
  let index = 0;
  return {
    async *streamChat(_messages: LlmMessage[]) {
      const text = replies[Math.min(index, replies.length - 1)] ?? replies.at(-1)!;
      index += 1;
      yield text;
    },
  };
}

const deps = {} as AiPipelineDeps;

describe("runAgentLoop", () => {
  it("emits timeline thought before respond without LLM tools", async () => {
    const session = createEmptySession();
    const llm = mockLlm([
      JSON.stringify({
        thought: "I'll answer from existing facts.",
        tool: "respond",
      }),
      "This is an on-chain transaction summary for the user.",
    ]);

    session.parseResult = {
      kind: "txHash",
      summary: "On-chain transaction",
      warnings: [],
      raw: "0xabc",
    };

    const events = [];
    for await (const event of runAgentLoop({
      session,
      input: { message: "What is this?", locale: "en" },
      deps,
      llm,
    })) {
      events.push(event);
    }

    expect(events.some((e) => e.type === "timeline" && e.entry.kind === "thought")).toBe(
      true,
    );
    expect(events.some((e) => e.type === "assistant_spec")).toBe(true);
  });
});
