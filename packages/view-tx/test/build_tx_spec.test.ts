import { describe, expect, it } from "vitest";
import { validateSpec } from "@beforesign/json-render-catalog";
const UNSIGNED_TX_HEX =
  "0x02e80180843b9aca008504a817c80082520894c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28080c0";
import { parseTransaction } from "viem";
import { buildTxSpec } from "../src/build_tx_spec.ts";

describe("buildTxSpec", () => {
  it("builds a valid unsigned tx spec", () => {
    const normalized = parseTransaction(UNSIGNED_TX_HEX);
    const result = buildTxSpec({ kind: "unsignedTx", normalized });

    expect(validateSpec(result.spec as never).valid).toBe(true);
    expect(result.title).toBe("Transaction");
    const elements = Object.values(result.spec.elements);
    expect(elements.some((element) => element.type === "Field" && element.props.label === "To")).toBe(
      true,
    );
  });
});
