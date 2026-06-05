import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientsBundle } from "@beforesign/clients";
import { detectInputType } from "@beforesign/detect";
import type { TypedDataDefinition } from "viem";
import { buildReview } from "../src/build_review.ts";
import { FIXTURE_NOW_MS, REVIEW_FIXTURE_CASES, usdcPermitFixture } from "./fixtures/index.ts";

function mockClients(): ClientsBundle {
  return {
    blockscout: { searchQuick: vi.fn() },
    etherscan: { getTransaction: vi.fn() },
    debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
  };
}

function normalizedFromJson(raw: string): TypedDataDefinition {
  const result = detectInputType(raw);
  if (result.kind !== "typedData") {
    throw new Error(`expected typedData, got ${result.kind}`);
  }
  return result.normalized;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXTURE_NOW_MS);
});

afterEach(() => {
  vi.useRealTimers();
});

describe.each(REVIEW_FIXTURE_CASES)("$name", (fixture) => {
  it("matches golden ReviewDocument", () => {
    const doc = buildReview(normalizedFromJson(fixture.input), mockClients(), fixture.payload);
    expect(doc).toEqual(fixture.output);
  });
});

describe("buildReview", () => {
  it("does not call clients", () => {
    const clients = mockClients();
    buildReview(normalizedFromJson(usdcPermitFixture.input), clients);
    expect(clients.blockscout.searchQuick).not.toHaveBeenCalled();
    expect(clients.etherscan.getTransaction).not.toHaveBeenCalled();
    expect(clients.debank.preExecTx).not.toHaveBeenCalled();
    expect(clients.debank.explainTx).not.toHaveBeenCalled();
  });
});
