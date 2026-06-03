import { describe, expect, it } from "vitest";
import { CALLDATA_HEX } from "@beforesign/test-fixtures";
import { parseCalldata } from "./calldata.ts";

describe("parseCalldata", () => {
  it("extracts selector", () => {
    const result = parseCalldata(CALLDATA_HEX);
    expect(result.selector).toBe("0xa9059cbb");
  });
});
