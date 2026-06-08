import { describe, expect, it } from "vitest";
import { formatArgValue } from "../src/field_descriptor.ts";

describe("formatArgValue", () => {
  it("formats tuple objects containing bigint", () => {
    const formatted = formatArgValue({
      recipient: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      amount: 1000000000000000000n,
    });
    expect(formatted).toContain("1000000000000000000");
    expect(() => JSON.stringify({ formatted })).not.toThrow();
  });
});
