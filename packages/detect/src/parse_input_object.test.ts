import { validateTypedData } from "viem";
import { describe, expect, it } from "vitest";
import { detectInputType } from "./input_type.ts";
import {
  normalizeRawInputToJson,
  parseInputObject,
} from "./parse_input_object.ts";
import { normalizeTypedDataFromJson } from "./normalize_typed_data.ts";

const PERMIT2_OBJECT_LITERAL = `{
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    PermitDetails: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "expiration", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    PermitSingle: [
      { name: "details", type: "PermitDetails" },
      { name: "spender", type: "address" },
      { name: "sigDeadline", type: "uint256" },
    ],
  },
  primaryType: "PermitSingle",
  domain: {
    name: "Permit2",
    chainId: 1,
    verifyingContract: "0x000000000022d473030f116ddee9fd6b43ac78b3",
  },
  message: {
    details: {
      token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      amount: "1000000",
      expiration: 1780517526,
      nonce: 0,
    },
    spender: "0x4a6c312ec70e8747a587ee860a0353cd42be0ae0",
    sigDeadline: 1780517526,
  },
}`;

describe("parseInputObject", () => {
  it("parses JavaScript object literals with unquoted keys and trailing commas", () => {
    const parsed = parseInputObject(PERMIT2_OBJECT_LITERAL);
    expect(parsed.primaryType).toBe("PermitSingle");
    expect(parsed.domain).toMatchObject({ name: "Permit2", chainId: 1 });
  });

  it("still accepts strict JSON", () => {
    const json = JSON.stringify(parseInputObject(PERMIT2_OBJECT_LITERAL));
    const parsed = parseInputObject(json);
    expect(parsed.primaryType).toBe("PermitSingle");
  });

  it("normalizes object literals to formatted JSON", () => {
    const json = normalizeRawInputToJson(PERMIT2_OBJECT_LITERAL);
    expect(json).toBeDefined();
    expect(json).toContain('"primaryType": "PermitSingle"');
    expect(json).not.toMatch(/^\s*primaryType:/m);
  });

  it("detects typed data from object literals", () => {
    const result = detectInputType(PERMIT2_OBJECT_LITERAL);
    expect(result.kind).toBe("typedData");
    if (result.kind !== "typedData") return;

    const fromJson = normalizeTypedDataFromJson(
      normalizeRawInputToJson(PERMIT2_OBJECT_LITERAL)!,
    );
    expect(result.normalized).toEqual(fromJson);
    expect(() => validateTypedData(result.normalized)).not.toThrow();
  });
});
