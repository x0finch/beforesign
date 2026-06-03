import { describe, expect, it, vi } from "vitest";
import { metamask_unsigned_json, tx_hash } from "@beforesign/test-fixtures";
import { parse_input } from "./parse_input.ts";

describe("parse_input", () => {
  it("parses unsigned tx without debank when disabled", async () => {
    const result = await parse_input(
      { raw: metamask_unsigned_json },
      {
        blockscout: { search_quick: vi.fn() },
        etherscan: { get_transaction: vi.fn() },
        debank: { pre_exec_tx: vi.fn(), explain_tx: vi.fn() },
        debank_enabled: false,
        blockscout_enabled: false,
      },
    );
    expect(result.kind).toBe("unsigned_tx");
    expect(result.tx?.from).toBeTruthy();
  });

  it("resolves tx hash via blockscout and etherscan", async () => {
    const result = await parse_input(
      { raw: tx_hash },
      {
        blockscout: {
          search_quick: vi.fn().mockResolvedValue({
            status: "resolved",
            hits: [{ id: "1", chain_id: 1, chain_name: "Ethereum" }],
            resolved_chain_id: 1,
          }),
        },
        etherscan: {
          get_transaction: vi.fn().mockResolvedValue({
            tx: { from: "0xabc", hash: tx_hash, chain_id: 1 },
            onchain: { chain_id: 1, status: "success" },
          }),
        },
        debank: { pre_exec_tx: vi.fn(), explain_tx: vi.fn() },
      },
    );
    expect(result.tx?.hash).toBe(tx_hash);
    expect(result.onchain?.status).toBe("success");
  });
});
