import { describe, expect, it } from "vitest";
import { explorer_tx_url, get_chain_by_id } from "./chains.ts";

describe("chains", () => {
  it("resolves ethereum chain", () => {
    const chain = get_chain_by_id(1);
    expect(chain?.name).toBe("Ethereum");
  });

  it("builds explorer tx url", () => {
    const url = explorer_tx_url(1, "0xabc");
    expect(url).toBe("https://etherscan.io/tx/0xabc");
  });

  it("returns undefined for unknown chain", () => {
    expect(get_chain_by_id(999999)).toBeUndefined();
  });
});
