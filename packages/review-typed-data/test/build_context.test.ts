import { describe, expect, it } from "vitest";
import { concat, keccak256 } from "viem";
import { detectInputType } from "@beforesign/detect";
import type { TypedDataDefinition } from "viem";
import { buildContext } from "../src/build_context.ts";
import { usdcPermitFixture } from "./fixtures/token_permit/usdc_permit.ts";

const HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;

function normalizedFromJson(raw: string): TypedDataDefinition {
  const result = detectInputType(raw);
  if (result.kind !== "typedData") {
    throw new Error(`expected typedData, got ${result.kind}`);
  }
  return result.normalized;
}

describe("buildContext", () => {
  it("computes domainHash, structHash, and signableHash for typed data", () => {
    const ctx = buildContext(normalizedFromJson(usdcPermitFixture.input));

    expect(ctx.domainHash).toMatch(HASH_PATTERN);
    expect(ctx.structHash).toMatch(HASH_PATTERN);
    expect(ctx.signableHash).toMatch(HASH_PATTERN);
  });

  it("derives signableHash from domainHash and structHash", () => {
    const ctx = buildContext(normalizedFromJson(usdcPermitFixture.input));

    expect(ctx.structHash).toBeDefined();
    const expected = keccak256(concat(["0x1901", ctx.domainHash, ctx.structHash!]));
    expect(ctx.signableHash).toBe(expected);
  });
});
