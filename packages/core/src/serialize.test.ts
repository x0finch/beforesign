import { describe, expect, it } from "vitest";
import { serializeParseResult } from "./serialize.ts";
import type { ParseResult } from "./types.ts";

describe("serializeParseResult", () => {
  it("serializes bigint values as strings", () => {
    const input = {
      kind: "txHash" as const,
      summary: "test",
      warnings: [],
      raw: "0xabc",
      view: {
        title: "Transaction",
        summary: "test",
        spec: {
          root: "field-1",
          elements: {
            "field-1": {
              type: "Field",
              props: { value: 123n },
              children: [],
              visible: true,
            },
          },
        },
      },
    } as unknown as ParseResult;
    const out = serializeParseResult(input);
    const field = out.view?.spec.elements["field-1"] as { props: { value: string } };
    expect(field.props.value).toBe("123");
  });

  it("round-trips parse result", () => {
    const input: ParseResult = {
      kind: "signedTx",
      summary: "测试",
      warnings: [],
      raw: { data: "0x" },
      tx: { value: "1000", chainId: 1 },
    };
    const out = serializeParseResult(input);
    expect(out.kind).toBe("signedTx");
    expect(out.tx?.value).toBe("1000");
  });
});
