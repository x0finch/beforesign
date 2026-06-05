import { describe, expect, it } from "vitest";
import { factsToRows, formatFactValue, inferFactKind } from "../src/facts_to_rows.ts";

describe("formatFactValue", () => {
  it("formats primitives and empty values", () => {
    expect(formatFactValue("tokenSymbol", "USDC")).toBe("USDC");
    expect(formatFactValue("tokenDecimals", 6)).toBe("6");
    expect(formatFactValue("hasCalldata", true)).toBe("Yes");
    expect(formatFactValue("hasCalldata", false)).toBe("No");
    expect(formatFactValue("hash", "")).toBe("—");
    expect(formatFactValue("missingFields", [])).toBe("—");
  });

  it("joins string arrays and stringifies other arrays", () => {
    expect(formatFactValue("missingFields", ["to", "value"])).toBe("to, value");
    expect(formatFactValue("items", [1, 2])).toBe("[1,2]");
  });

  it("stringifies nested objects", () => {
    expect(formatFactValue("meta", { nested: true })).toBe('{"nested":true}');
  });
});

describe("inferFactKind", () => {
  it("maps known hash and selector keys", () => {
    expect(inferFactKind("signableHash", "0xabc")).toBe("hash");
    expect(inferFactKind("hash", "0xabc")).toBe("hash");
    expect(inferFactKind("selector", "0x1234")).toBe("selector");
  });

  it("detects address and long hash strings", () => {
    expect(
      inferFactKind(
        "spender",
        "0x4a6c312ec70e8747a587ee860a0353cd42be0ae0",
      ),
    ).toBe("address");
    expect(
      inferFactKind(
        "signableHash",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      ),
    ).toBe("hash");
  });

  it("maps booleans to bool and defaults to text", () => {
    expect(inferFactKind("hasCalldata", true)).toBe("bool");
    expect(inferFactKind("primaryType", "Permit")).toBe("text");
  });
});

describe("factsToRows", () => {
  it("sorts keys and maps known labels", () => {
    const rows = factsToRows({
      scenarioId: "tokenPermit",
      primaryType: "Permit",
      signableHash: "0xabc",
    });

    expect(rows.map((row) => row.id)).toEqual([
      "facts.primaryType",
      "facts.scenarioId",
      "facts.signableHash",
    ]);
    expect(rows.find((row) => row.id === "facts.primaryType")?.label).toBe("Primary type");
    expect(rows.find((row) => row.id === "facts.scenarioId")?.label).toBe("Scenario");
    expect(rows.find((row) => row.id === "facts.signableHash")?.kind).toBe("hash");
  });

  it("falls back to title-case labels for unknown keys", () => {
    const [row] = factsToRows({ customFieldName: "value" });
    expect(row.label).toBe("Custom Field Name");
  });
});
