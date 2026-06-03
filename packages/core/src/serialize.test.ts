import { describe, expect, it } from "vitest";
import { serialize_parse_result } from "./serialize.ts";
import type { parse_result } from "./types.ts";

describe("serialize_parse_result", () => {
  it("round-trips parse result", () => {
    const input: parse_result = {
      kind: "signed_tx",
      summary: "测试",
      warnings: [],
      raw: { data: "0x" },
      tx: { value: "1000", chain_id: 1 },
    };
    const out = serialize_parse_result(input);
    expect(out.kind).toBe("signed_tx");
    expect(out.tx?.value).toBe("1000");
  });
});
