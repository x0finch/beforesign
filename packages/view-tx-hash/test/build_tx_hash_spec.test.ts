import { describe, expect, it } from "vitest";
import { validateSpec } from "@beforesign/json-render-catalog";
import { buildTxHashSpec } from "../src/build_tx_hash_spec.ts";

describe("buildTxHashSpec", () => {
  it("builds a valid tx hash spec for resolved tx", () => {
    const result = buildTxHashSpec({
      hash: "0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123ab",
      chainId: 1,
      tx: {
        chainId: 1,
        from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        to: "0x0000000000000000000000000000000000000000",
        value: "0",
        data: "0x",
      },
      onchain: { chainId: 1, status: "success" },
      discovery: { status: "resolved", hits: [] },
    });

    expect(validateSpec(result.spec as never).valid).toBe(true);
    expect(result.summary).toContain("On-chain transaction");
  });
});
