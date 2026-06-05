import { describe, expect, it, vi } from "vitest";
import { encodeFunctionData, encodeFunctionResult, erc20Abi } from "viem";
import { createEtherscanClient } from "./etherscan.ts";

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const symbolData = encodeFunctionData({ abi: erc20Abi, functionName: "symbol" });
const decimalsData = encodeFunctionData({ abi: erc20Abi, functionName: "decimals" });
const symbolResult = encodeFunctionResult({
  abi: erc20Abi,
  functionName: "symbol",
  result: "USDC",
});
const decimalsResult = encodeFunctionResult({
  abi: erc20Abi,
  functionName: "decimals",
  result: 6,
});

describe("etherscan client", () => {
  it("decodes token symbol and decimals via eth_call", async () => {
    const fetchFn = vi.fn(async (input: string | URL | Request) => {
      const parsed = new URL(input.toString());
      const data = parsed.searchParams.get("data");
      const result =
        data === symbolData ? symbolResult : data === decimalsData ? decimalsResult : "0x";
      return {
        ok: true,
        json: async () => ({ result }),
      };
    });

    const client = createEtherscanClient({
      apiKey: "test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    const info = await client.getTokenInfo(1, USDC);
    expect(info).toEqual({ symbol: "USDC", decimals: 6 });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
