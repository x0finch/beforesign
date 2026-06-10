import { describe, expect, it, vi } from "vitest";
import { createOpenAIConversation } from "../src/create_conversation.ts";

describe("createOpenAIConversation", () => {
  it("POSTs /conversations and returns conv_* id", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "conv_test123" }), { status: 200 }),
    );

    const id = await createOpenAIConversation(
      { apiKey: "test-key", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
      fetchFn,
    );

    expect(id).toBe("conv_test123");
    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.openai.com/v1/conversations",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      }),
    );
  });

  it("rejects missing apiKey", async () => {
    await expect(
      createOpenAIConversation({ apiKey: "", model: "gpt-4o-mini" }),
    ).rejects.toThrow(/apiKey/);
  });

  it("rejects invalid response id", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "not-a-conv" }), { status: 200 }),
    );

    await expect(
      createOpenAIConversation({ apiKey: "k", model: "m" }, fetchFn),
    ).rejects.toThrow(/conv_\*/);
  });
});
