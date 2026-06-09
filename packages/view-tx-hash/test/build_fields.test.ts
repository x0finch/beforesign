import { describe, expect, it } from "vitest";
import { buildTxHashSummary } from "../src/build_fields.ts";

describe("buildTxHashSummary", () => {
  it("describes contract calls when data is present without eth value", () => {
    const summary = buildTxHashSummary({
      hash: "0xabc",
      tx: {
        chainId: 1,
        from: "0x1",
        to: "0x2",
        value: "0",
        data: "0xa9059cbb",
        hash: "0xabc",
      },
      onchain: { chainId: 1, status: "success" },
    });
    expect(summary).toContain("contract call");
    expect(summary).not.toContain("counterparties");
  });

  it("keeps counterparties wording for eth transfers", () => {
    const summary = buildTxHashSummary({
      hash: "0xabc",
      tx: {
        chainId: 1,
        from: "0x1",
        to: "0x2",
        value: "0x1",
        data: "0x",
        hash: "0xabc",
      },
      onchain: { chainId: 1, status: "success" },
    });
    expect(summary).toContain("counterparties");
  });
});
