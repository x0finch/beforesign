import { describe, expect, it, vi } from "vitest";
import { blockscout_single_hit, tx_hash } from "@beforesign/test-fixtures";
import { create_blockscout_client } from "./blockscout.ts";

describe("blockscout client", () => {
  it("maps single transaction hit", async () => {
    const fetch_fn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => blockscout_single_hit,
    });
    const client = create_blockscout_client({ api_key: "test", fetch_fn });
    const result = await client.search_quick(tx_hash);
    expect(result.status).toBe("resolved");
    expect(result.resolved_chain_id).toBe(1);
  });
});
