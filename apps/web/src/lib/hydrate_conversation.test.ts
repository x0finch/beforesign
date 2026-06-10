import { describe, expect, it } from "vitest";
import {
  hydrateConversationToMessages,
  inferLastRawFromConversation,
} from "./hydrate_conversation.ts";

const TX_HASH =
  "0x945840884f6f041527cb5063e835152e9e349053b07b2c21b2eb52d48933a852";

describe("hydrateConversationToMessages", () => {
  it("maps user, assistant, artifact, and tool timeline entries", () => {
    const messages = hydrateConversationToMessages([
      { role: "system", content: "ignored" },
      { role: "user", content: TX_HASH },
      {
        role: "tool",
        name: "build_view",
        output: '{"spec":{"root":"root","elements":{}}}',
        status: "completed",
      },
      { role: "assistant", content: "Done." },
      { role: "tool", name: "detect_input", output: '{"kind":"txHash"}' },
    ]);

    expect(messages).toHaveLength(4);
    expect(messages[0]).toMatchObject({ kind: "user", content: TX_HASH });
    expect(messages[1]).toMatchObject({ kind: "artifact" });
    expect(messages[2]).toMatchObject({ kind: "assistant_text", content: "Done." });
    expect(messages[3]).toMatchObject({
      kind: "timeline",
      entry: { kind: "tool", name: "detect_input", status: "done" },
    });
  });
});

describe("inferLastRawFromConversation", () => {
  it("returns last user message that looks like a parse target", () => {
    expect(
      inferLastRawFromConversation([
        { role: "user", content: TX_HASH },
        { role: "assistant", content: "ok" },
        { role: "user", content: "follow up question" },
      ]),
    ).toBe(TX_HASH);
  });
});
