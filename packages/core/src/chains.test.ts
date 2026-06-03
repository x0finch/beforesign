import { describe, expect, it } from "vitest";
import { explorerTxUrl, getChainById } from "./chains.ts";

describe("chains", () => {
  it("resolves ethereum chain", () => {
    const chain = getChainById(1);
    expect(chain?.name).toBe("Ethereum");
  });

  it("builds explorer tx url", () => {
    const url = explorerTxUrl(1, "0xabc");
    expect(url).toBe("https://etherscan.io/tx/0xabc");
  });

  it("returns undefined for unknown chain", () => {
    expect(getChainById(999999)).toBeUndefined();
  });
});
