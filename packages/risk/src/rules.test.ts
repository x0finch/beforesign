import { describe, expect, it } from "vitest";
import type { parse_result } from "@beforesign/core";
import { run_risk_rules } from "./rules.ts";

describe("run_risk_rules", () => {
  it("warns on unlimited approval", () => {
    const result: parse_result = {
      kind: "calldata",
      summary: "",
      warnings: [],
      raw: null,
      calldata: {
        selector: "0x",
        function_name: "approve",
        args: [{ name: "amount", type: "uint256", value: "115792089237316195423570985008687907853269984665640564039457584007913129639935" }],
        raw: "0x",
      },
    };
    const warnings = run_risk_rules(result);
    expect(warnings.some((w) => w.code === "unlimited_approval")).toBe(true);
  });
});
