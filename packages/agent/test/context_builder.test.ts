import { describe, expect, it } from "vitest";
import { buildFactsContext, getParseFacts } from "../src/context_builder.ts";

describe("context_builder", () => {
  it("returns placeholder when no result", () => {
    expect(buildFactsContext(undefined)).toContain("No parse result");
  });

  it("summarizes spec as review fields not raw JSON", () => {
    const facts = buildFactsContext({
      kind: "txHash",
      summary: "On-chain transaction",
      warnings: [],
      raw: "0xabc",
      view: {
        title: "Transaction",
        summary: "On-chain transaction",
        spec: {
          root: "card-1",
          elements: {
            "field-1": {
              type: "Field",
              props: { label: "Hash", value: "0xabc", displayValue: null, kind: "hash" },
            },
          },
        },
      },
    });
    expect(facts).toContain("reviewFields:");
    expect(facts).toContain("Hash: 0xabc");
    expect(facts).not.toContain('"op":"add"');
    expect(facts).not.toContain("viewSpec:");
  });

  it("getParseFacts returns summary path", () => {
    const facts = getParseFacts(
      {
        kind: "calldata",
        summary: "approve",
        warnings: [],
        raw: "0x",
      },
      "summary",
    );
    expect(facts).toBe("approve");
  });
});
