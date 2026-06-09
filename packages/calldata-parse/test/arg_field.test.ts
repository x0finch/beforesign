import { describe, expect, it } from "vitest";
import { argFieldId, argFieldLabel, arrayElementLabel } from "../src/utils/arg_field.ts";

describe("argFieldId", () => {
  it("uses arg index in field id", () => {
    expect(argFieldId("calldata", 0)).toBe("calldata.args.0");
    expect(argFieldId("calldata.inner.0#1", 4)).toBe("calldata.inner.0#1.args.4");
  });
});

describe("argFieldLabel", () => {
  it("uses ABI name when present", () => {
    expect(
      argFieldLabel({ name: "recipient", type: "address", value: "0xabc", displayValue: "0xabc" }, 0),
    ).toBe("recipient");
  });

  it("uses indexed type label when ABI name is empty", () => {
    expect(
      argFieldLabel({ name: "", type: "uint128", value: 1n, displayValue: "1" }, 2),
    ).toBe("#2 uint128");
  });
});

describe("arrayElementLabel", () => {
  it("formats simple array elements with element type", () => {
    expect(arrayElementLabel("bytes32[]", 0)).toBe("bytes32[0]");
    expect(arrayElementLabel("address[]", 3)).toBe("address[3]");
  });
});
