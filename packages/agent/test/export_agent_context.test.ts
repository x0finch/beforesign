import { describe, expect, it } from "vitest";
import {
  buildAgentContextExport,
  buildUserTurn,
  flattenMemoryItems,
} from "../src/export_agent_context.ts";
import { normalizeAskInput } from "../src/normalize_ask_input.ts";
import { createEmptySession } from "../src/session_state.ts";

const TX_HASH =
  "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852";

describe("buildUserTurn", () => {
  it("sends only raw when user pastes pure hex", () => {
    const session = createEmptySession();
    const normalized = normalizeAskInput({
      message: TX_HASH,
      raw: TX_HASH,
      locale: "zh",
    });

    expect(buildUserTurn(session, normalized)).toBe(TX_HASH);
    expect(buildUserTurn(session, normalized)).not.toContain("User message:");
    expect(buildUserTurn(session, normalized)).not.toContain("Parse target:");
  });

  it("sends only message when natural language differs from parse target", () => {
    const session = createEmptySession();
    const normalized = normalizeAskInput({
      message: "What is this tx?",
      raw: TX_HASH,
      locale: "en",
    });

    expect(buildUserTurn(session, normalized)).toBe("What is this tx?");
  });

  it("sends only message for follow-up without parse target", () => {
    const session = createEmptySession();
    const normalized = normalizeAskInput({
      message: "继续解析data",
      locale: "zh",
    });

    expect(buildUserTurn(session, normalized)).toBe("继续解析data");
  });
});

describe("flattenMemoryItems", () => {
  it("flattens user, merged tool call/result, and assistant messages", () => {
    const conversation = flattenMemoryItems([
      { type: "message", role: "user", content: TX_HASH },
      {
        type: "function_call",
        callId: "call_1",
        name: "build_view",
        arguments: "{}",
      },
      {
        type: "function_call_result",
        name: "build_view",
        callId: "call_1",
        status: "completed",
        output: {
          type: "text",
          text: '{"spec":{"root":"root","elements":{}}}',
        },
      },
      {
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text: "Done." }],
      },
    ]);

    expect(conversation).toEqual([
      { role: "user", content: TX_HASH },
      {
        role: "tool",
        name: "build_view",
        arguments: "{}",
        output: '{"spec":{"root":"root","elements":{}}}',
        status: "completed",
      },
      { role: "assistant", content: "Done." },
    ]);
  });

  it("truncates long hex in tool output", () => {
    const longHex = `0x${"ab".repeat(120)}`;
    const conversation = flattenMemoryItems([
      {
        type: "function_call_result",
        name: "build_view",
        callId: "call_1",
        status: "completed",
        output: { type: "text", text: longHex },
      },
    ]);

    expect(conversation[0]).toMatchObject({ role: "tool" });
    expect((conversation[0] as { output: string }).output).toContain("bytes)");
    expect((conversation[0] as { output: string }).output.length).toBeLessThan(longHex.length);
  });
});

const testLlm = { apiKey: "test-key", model: "gpt-4o-mini" };

describe("buildAgentContextExport", () => {
  it("exports conversation with system prompt only", async () => {
    const session = createEmptySession("conv_test");
    session.agentMemory = { getItems: async () => [] } as never;

    const snapshot = await buildAgentContextExport(session, "en", testLlm);

    expect(snapshot.conversationId).toBe("conv_test");
    expect(snapshot.locale).toBe("en");
    expect(snapshot.conversation[0]).toEqual({
      role: "system",
      content: expect.stringContaining("BeforeSign Agent"),
    });
    expect(snapshot.conversation).toHaveLength(1);
    expect(snapshot).not.toHaveProperty("turn");
    expect(snapshot).not.toHaveProperty("parseResult");
    expect(snapshot).not.toHaveProperty("agent");
    expect(snapshot).not.toHaveProperty("session");
    expect(snapshot).not.toHaveProperty("agentMemoryItems");
  });

  it("prepends system before memory conversation", async () => {
    const session = createEmptySession("conv_zh");
    session.agentMemory = { getItems: async () => [] } as never;

    const snapshot = await buildAgentContextExport(session, "zh", testLlm);

    expect(snapshot.conversation[0]?.role).toBe("system");
    expect(snapshot).not.toHaveProperty("turn");
    expect(snapshot).not.toHaveProperty("parseResult");
  });
});
