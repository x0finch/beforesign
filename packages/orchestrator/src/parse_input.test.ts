import { describe, expect, it, vi } from "vitest";
import { METAMASK_UNSIGNED_JSON, TX_HASH } from "@beforesign/test-fixtures";
import { parseInput } from "./parse_input.ts";

describe("parseInput", () => {
  it("parses unsigned tx without debank when disabled", async () => {
    const result = await parseInput(
      { raw: METAMASK_UNSIGNED_JSON },
      {
        blockscout: { searchQuick: vi.fn() },
        etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
        debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
        debankEnabled: false,
        blockscoutEnabled: false,
      },
    );
    expect(result.kind).toBe("unsignedTx");
    expect(result.tx?.from).toBeTruthy();
  });

  it("resolves tx hash via blockscout and etherscan", async () => {
    const result = await parseInput(
      { raw: TX_HASH },
      {
        blockscout: {
          searchQuick: vi.fn().mockResolvedValue({
            status: "resolved",
            hits: [{ id: "1", chainId: 1, chainName: "Ethereum" }],
            resolvedChainId: 1,
          }),
        },
        etherscan: {
          getTransaction: vi.fn().mockResolvedValue({
            tx: { from: "0xabc", hash: TX_HASH, chainId: 1 },
            onchain: { chainId: 1, status: "success" },
          }),
          getTokenInfo: vi.fn(),
        },
        debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
      },
    );
    expect(result.tx?.hash).toBe(TX_HASH);
    expect(result.onchain?.status).toBe("success");
  });
});
