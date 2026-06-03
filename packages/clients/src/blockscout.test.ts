import { describe, expect, it, vi } from "vitest";
import { BLOCKSCOUT_SINGLE_HIT, TX_HASH } from "@beforesign/test-fixtures";
import { createBlockscoutClient } from "./blockscout.ts";

describe("blockscout client", () => {
  it("maps single transaction hit", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => BLOCKSCOUT_SINGLE_HIT,
    });
    const client = createBlockscoutClient({ apiKey: "test", fetchFn });
    const result = await client.searchQuick(TX_HASH);
    expect(result.status).toBe("resolved");
    expect(result.resolvedChainId).toBe(1);
  });
});
