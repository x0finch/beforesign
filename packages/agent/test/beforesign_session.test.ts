import { describe, expect, it } from "vitest";
import { OpenAIConversationsSession } from "@openai/agents";
import {
  getAgentMemorySession,
  isOpenAIConversationId,
} from "../src/beforesign_session.ts";
import { createEmptySession } from "../src/session_state.ts";

describe("isOpenAIConversationId", () => {
  it("accepts conv-prefixed ids only", () => {
    expect(isOpenAIConversationId("conv_abc123")).toBe(true);
    expect(isOpenAIConversationId("9637d40a-b524-4cf2-b399-505642dd5d5a")).toBe(false);
    expect(isOpenAIConversationId(undefined)).toBe(false);
  });
});

describe("getAgentMemorySession", () => {
  it("creates OpenAIConversationsSession without passing client UUID as conversationId", () => {
    const session = createEmptySession();
    const memory = getAgentMemorySession(session, {
      apiKey: "test-key",
      model: "gpt-4.1",
    });

    expect(memory).toBeInstanceOf(OpenAIConversationsSession);
    expect((memory as { sessionId?: string }).sessionId).toBeUndefined();
  });

  it("reuses stored conv id on follow-up turns", () => {
    const session = createEmptySession();
    session.openaiConversationId = "conv_follow_up";

    const memory = getAgentMemorySession(session, {
      apiKey: "test-key",
      model: "gpt-4.1",
    });

    expect((memory as { sessionId?: string }).sessionId).toBe("conv_follow_up");
  });

  it("requires apiKey", () => {
    const session = createEmptySession();
    expect(() =>
      getAgentMemorySession(session, { apiKey: "", model: "gpt-4.1" }),
    ).toThrow(/apiKey/);
  });
});
