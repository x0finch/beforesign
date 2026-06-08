import { describe, expect, it, vi } from "vitest";
import {
  CALLDATA_HEX,
  TENDERLY_SEARCH_AMBIGUOUS,
  TENDERLY_SEARCH_NATIVE,
  TENDERLY_SEARCH_SINGLE,
  TX_HASH,
} from "@beforesign/test-fixtures";
import { createTenderlyClient } from "./tenderly.ts";

describe("tenderly client", () => {
  it("maps single transaction hit", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => TENDERLY_SEARCH_SINGLE,
    });
    const client = createTenderlyClient({ fetchFn });
    const result = await client.searchQuick(TX_HASH);
    expect(result.status).toBe("resolved");
    expect(result.resolvedChainId).toBe(1);
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining("api.tenderly.co/api/v1/search"),
      expect.any(Object),
    );
  });

  it("maps ambiguous transaction hits", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => TENDERLY_SEARCH_AMBIGUOUS,
    });
    const client = createTenderlyClient({ fetchFn });
    const result = await client.searchQuick(TX_HASH);
    expect(result.status).toBe("ambiguous");
    expect(result.hits).toHaveLength(2);
  });

  it("fetches transaction with raw input", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => TENDERLY_SEARCH_SINGLE,
    });
    const client = createTenderlyClient({ fetchFn });
    const result = await client.getTransaction(1, TX_HASH);

    expect(result.tx.data).toBe(CALLDATA_HEX);
    expect(result.tx.from).toBe("0x00192fb10df37c9fb26829eb2cc623cd1bf599e8");
    expect(result.tx.value).toBe("7165918000000000");
    expect(result.onchain.status).toBe("success");
    expect(result.decodedMethod).toBe("transfer(address,uint256)");
  });

  it("maps native transfer with empty input", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => TENDERLY_SEARCH_NATIVE,
    });
    const client = createTenderlyClient({ fetchFn });
    const result = await client.getTransaction(1, TX_HASH);
    expect(result.tx.data).toBe("0x");
    expect(result.decodedMethod).toBeUndefined();
  });

  it("infers success when status is null but block_number is set", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transactions: [
          {
            ...TENDERLY_SEARCH_SINGLE.transactions[0]!,
            status: null,
            block_number: 25256041,
          },
        ],
      }),
    });
    const client = createTenderlyClient({ fetchFn });
    const result = await client.getTransaction(1, TX_HASH);
    expect(result.onchain.status).toBe("success");
    expect(result.onchain.blockNumber).toBe("25256041");
  });

  it("sends access key when configured", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => TENDERLY_SEARCH_SINGLE,
    });
    const client = createTenderlyClient({ accessKey: "test-key", fetchFn });
    await client.searchQuick(TX_HASH);
    expect(fetchFn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { "X-Access-Key": "test-key" },
      }),
    );
  });
});
