import { describe, expect, it } from "vitest";
import type { ParseResult } from "@beforesign/core";
import { runRiskRules } from "./rules.ts";

describe("runRiskRules", () => {
  it("warns on unlimited approval", () => {
    const result: ParseResult = {
      kind: "calldata",
      summary: "",
      warnings: [],
      raw: null,
      calldata: {
        selector: "0x",
        functionName: "approve",
        args: [
          {
            name: "amount",
            type: "uint256",
            value:
              "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          },
        ],
        raw: "0x",
      },
    };
    const warnings = runRiskRules(result);
    expect(warnings.some((w) => w.code === "unlimitedApproval")).toBe(true);
  });
});
