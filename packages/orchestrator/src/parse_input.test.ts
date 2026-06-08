import { describe, expect, it, vi } from "vitest";
import {
  CALLDATA_HEX,
  METAMASK_UNSIGNED_JSON,
  TENDERLY_SEARCH_SINGLE,
  TX_HASH,
} from "../test/fixtures.ts";
import { findBigIntPaths } from "@beforesign/core";
import { parseInput } from "./parse_input.ts";

describe("parseInput", () => {
  it("parses unsigned tx without debank when disabled", async () => {
    const result = await parseInput(
      { raw: METAMASK_UNSIGNED_JSON },
      {
        txLookup: { searchQuick: vi.fn(), getTransaction: vi.fn() },
        etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
        debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
        signatureLookup: { resolveBySelector: vi.fn().mockResolvedValue(undefined) },
        debankEnabled: false,
        txLookupEnabled: false,
      },
    );
    expect(result.kind).toBe("unsignedTx");
    expect(result.view?.title).toBe("Transaction");
    expect(result.view?.chainId).toBeTruthy();
  });

  it("resolves tx hash via tenderly search", async () => {
    const tx = TENDERLY_SEARCH_SINGLE.transactions[0]!;
    const result = await parseInput(
      { raw: TX_HASH },
      {
        txLookup: {
          searchQuick: vi.fn().mockResolvedValue({
            status: "resolved",
            hits: [
              {
                id: "1-hit",
                chainId: 1,
                chainName: "Ethereum",
              },
            ],
            resolvedChainId: 1,
          }),
          getTransaction: vi.fn().mockResolvedValue({
            tx: {
              chainId: 1,
              from: tx.from,
              to: tx.to,
              value: "2875624785376768",
              data: CALLDATA_HEX,
              hash: TX_HASH,
            },
            onchain: {
              chainId: 1,
              status: "success",
              blockNumber: String(tx.block_number),
            },
            decodedMethod: tx.method,
            timestamp: tx.timestamp,
          }),
        },
        etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
        debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
        signatureLookup: { resolveBySelector: vi.fn().mockResolvedValue(undefined) },
      },
    );

    expect(result.kind).toBe("txHash");
    expect(result.view?.title).toBe("Transaction");
    expect(result.view?.chainId).toBe(1);
    expect(result.view?.discovery?.status).toBe("resolved");
    expect(result.view?.summary).toContain("On-chain transaction");
    expect(findBigIntPaths(result)).toEqual([]);
  });
});
