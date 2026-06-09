import { describe, expect, it } from "vitest";
import type { ParseResult, ViewSpec } from "@beforesign/core";
import {
  canDrillIntoCalldata,
  extractCalldataSource,
} from "../src/tools/extract_calldata.ts";

const CALLDATA =
  "0xa9059cbb0000000000000000000000000000000000000000000000000000000000000001";

function txSpec(data: string, to?: string): ViewSpec {
  const elements: ViewSpec["elements"] = {
    data: {
      type: "Field",
      props: { label: "Data", value: data },
    },
  };
  if (to) {
    elements.to = {
      type: "Field",
      props: { label: "To", value: to },
    };
  }
  return { root: "card", elements };
}

function txResult(overrides: Partial<ParseResult> = {}): ParseResult {
  return {
    kind: "txHash",
    summary: "On-chain transaction",
    warnings: [],
    raw: "0xabc",
    view: {
      title: "Transaction",
      summary: "On-chain transaction",
      chainId: 1,
      spec: txSpec(CALLDATA, "0xContract"),
    },
    ...overrides,
  };
}

describe("extractCalldataSource", () => {
  it("reads Data and To from tx view spec", () => {
    const source = extractCalldataSource(txResult());
    expect(source.calldata).toBe(CALLDATA);
    expect(source.contractAddress).toBe("0xContract");
    expect(source.chainId).toBe(1);
  });

  it("falls back to raw.data for signed tx objects", () => {
    const source = extractCalldataSource(
      txResult({
        kind: "signedTx",
        view: undefined,
        raw: { to: "0xTo", data: CALLDATA },
      }),
    );
    expect(source.calldata).toBe(CALLDATA);
    expect(source.contractAddress).toBeNull();
  });

  it("returns null calldata for empty 0x data", () => {
    const source = extractCalldataSource(
      txResult({
        view: {
          title: "Transaction",
          summary: "tx",
          spec: txSpec("0x"),
        },
      }),
    );
    expect(source.calldata).toBeNull();
    expect(
      canDrillIntoCalldata(
        txResult({
          view: {
            title: "Transaction",
            summary: "tx",
            spec: txSpec("0x"),
          },
        }),
      ),
    ).toBe(false);
  });
});
