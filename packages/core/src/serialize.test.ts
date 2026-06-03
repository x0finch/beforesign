import { describe, expect, it } from "vitest";
import { serializeParseResult } from "./serialize.ts";
import type { ParseResult } from "./types.ts";

describe("serializeParseResult", () => {
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
