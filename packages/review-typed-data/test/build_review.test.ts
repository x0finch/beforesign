import type { ClientsBundle } from "@beforesign/clients";
import { detectInputType } from "@beforesign/detect";
import type { TypedDataDefinition } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildReview } from "../src/build_review.ts";
import { siweFixture } from "./fixtures/auth/siwe.ts";
import { mailFixture } from "./fixtures/generic/mail.ts";
import {
  FIXTURE_NOW_MS,
  REVIEW_FIXTURE_CASES,
  usdcPermitFixture,
} from "./fixtures/index.ts";
import { permit2Fixture } from "./fixtures/permit2/permit2.ts";

const USDC_TOKEN = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDC_TOKEN_INFO = { symbol: "USDC", decimals: 6 };

function mockClients(): ClientsBundle {
  return {
    txLookup: { searchQuick: vi.fn(), getTransaction: vi.fn() },
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
    expect(clients.txLookup.searchQuick).not.toHaveBeenCalled();
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

  it("labels token permit value field as Allowance", async () => {
    const doc = await buildReview(normalizedFromJson(usdcPermitFixture.input), mockClients());
    const valueCheck = doc.checks.find((check) => check.id === "message.value");
    expect(valueCheck?.label).toBe("Allowance");
  });

  it("labels permit2 allowance and deadline fields for review", async () => {
    const doc = await buildReview(normalizedFromJson(permit2Fixture.input), mockClients());
    const allowanceCheck = doc.checks.find((check) => check.id === "message.details.amount");
    const deadlineCheck = doc.checks.find((check) => check.id === "message.sigDeadline");
    expect(allowanceCheck?.label).toBe("Allowance");
    expect(deadlineCheck?.label).toBe("Deadline");
    expect(doc.checks.find((check) => check.id === "guidance.owner")).toBeUndefined();
  });

  function highlightedIds(doc: Awaited<ReturnType<typeof buildReview>>): string[] {
    return doc.checks.filter((check) => check.highlight).map((check) => check.id);
  }

  it("highlights only summary focus fields for USDC permit", async () => {
    const doc = await buildReview(normalizedFromJson(usdcPermitFixture.input), mockClients());
    expect(highlightedIds(doc)).toEqual([
      "message.owner",
      "message.spender",
      "message.value",
    ]);
  });

  it("highlights only summary focus fields for permit2", async () => {
    const doc = await buildReview(normalizedFromJson(permit2Fixture.input), mockClients());
    expect(highlightedIds(doc)).toEqual([
      "message.details.token",
      "message.details.amount",
      "message.spender",
    ]);
  });
});
