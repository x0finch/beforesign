import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientsBundle } from "@beforesign/clients";
import { detectInputType } from "@beforesign/detect";
import type { TypedDataDefinition } from "viem";
import { buildReview } from "../src/build_review.ts";
import {
  FIXTURE_NOW_MS,
  REVIEW_FIXTURE_CASES,
  usdcPermitFixture,
} from "./fixtures/index.ts";
import { mailFixture } from "./fixtures/generic/mail.ts";
import { siweFixture } from "./fixtures/auth/siwe.ts";

const USDC_TOKEN = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDC_TOKEN_INFO = { symbol: "USDC", decimals: 6 };

function mockClients(): ClientsBundle {
  return {
    blockscout: { searchQuick: vi.fn() },
    etherscan: {
      getTransaction: vi.fn(),
      getTokenInfo: vi.fn().mockResolvedValue(USDC_TOKEN_INFO),
    },
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
  it("matches golden ReviewDocument", async () => {
    const doc = await buildReview(
      normalizedFromJson(fixture.input),
      mockClients(),
      fixture.payload,
    );
    expect(doc).toEqual(fixture.output);
  });
});

describe("buildReview", () => {
  it("fetches token info for USDC permit", async () => {
    const clients = mockClients();
    await buildReview(normalizedFromJson(usdcPermitFixture.input), clients);
    expect(clients.etherscan.getTokenInfo).toHaveBeenCalledWith(1, USDC_TOKEN);
    expect(clients.blockscout.searchQuick).not.toHaveBeenCalled();
    expect(clients.etherscan.getTransaction).not.toHaveBeenCalled();
    expect(clients.debank.preExecTx).not.toHaveBeenCalled();
    expect(clients.debank.explainTx).not.toHaveBeenCalled();
  });

  it("does not fetch token info for generic or auth scenarios", async () => {
    const clients = mockClients();
    await buildReview(normalizedFromJson(mailFixture.input), clients);
    await buildReview(normalizedFromJson(siweFixture.input), clients);
    expect(clients.etherscan.getTokenInfo).not.toHaveBeenCalled();
  });

  it("omits amount displayValue when getTokenInfo fails", async () => {
    const clients = mockClients();
    vi.mocked(clients.etherscan.getTokenInfo).mockRejectedValue(new Error("rate limited"));
    const doc = await buildReview(normalizedFromJson(usdcPermitFixture.input), clients);
    const valueCheck = doc.checks.find((check) => check.id === "message.value");
    expect(valueCheck?.displayValue).toBeUndefined();
    expect(doc.facts?.tokenSymbol).toBeUndefined();
  });
});
