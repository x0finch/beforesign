import { describe, expect, it } from "vitest";
import { resolveChainId } from "./resolve_chain_id.ts";

describe("resolveChainId", () => {
  it("prefers user chain id", () => {
    const id = resolveChainId({ status: "resolved", hits: [], resolvedChainId: 1 }, 137);
    expect(id).toBe(137);
  });

  it("uses single hit", () => {
    const id = resolveChainId({
      status: "ambiguous",
      hits: [{ id: "1-0x", chainId: 42161, chainName: "Arbitrum" }],
    });
    expect(id).toBe(42161);
  });
});
