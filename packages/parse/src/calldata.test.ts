import { describe, expect, it } from "vitest";
import { calldata_hex } from "@beforesign/test-fixtures";
import { parse_calldata } from "./calldata.ts";

describe("parse_calldata", () => {
  it("extracts selector", () => {
    const result = parse_calldata(calldata_hex);
    expect(result.selector).toBe("0xa9059cbb");
  });
});
