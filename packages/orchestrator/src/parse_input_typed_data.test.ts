import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientsBundle } from "@beforesign/clients";
import { parseInput } from "./parse_input.ts";

const USDC_PERMIT_JSON = JSON.stringify({
  domain: {
    name: "USD Coin",
    version: "2",
    chainId: 1,
    verifyingContract: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  message: {
    owner: "0x974caa59e49682cda0ad2bbe82983419a2ecc400",
    spender: "0x4a6c312ec70e8747a587ee860a0353cd42be0ae0",
    value: "9420522466979",
    nonce: "0",
    deadline: "1780517526",
  },
  primaryType: "Permit",
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  },
});

const FIXTURE_NOW_MS = 1_700_000_000_000;
const USDC_TOKEN = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

function mockClients(): ClientsBundle {
  return {
    txLookup: { searchQuick: vi.fn(), getTransaction: vi.fn() },
    etherscan: {
      getTransaction: vi.fn(),
      getTokenInfo: vi.fn().mockResolvedValue({ symbol: "USDC", decimals: 6 }),
    },
    debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
    signatureLookup: { resolveBySelector: vi.fn().mockResolvedValue(undefined) },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXTURE_NOW_MS);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("parseInput typedData view", () => {
  it("attaches ViewResult for USDC permit", async () => {
    const result = await parseInput(
      { raw: USDC_PERMIT_JSON },
      { ...mockClients(), txLookupEnabled: false, debankEnabled: false },
    );

    expect(result.kind).toBe("typedData");
    expect(result.view?.title).toBe("EIP-712 Typed Data Signature");
    expect(result.view?.scenarioId).toBe("tokenPermit");
    expect(result.view?.spec.root).toBeTruthy();
    expect(Object.keys(result.view?.spec.elements ?? {}).length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.code === "longDeadline")).toBe(true);
  });

  it("adds ownerMismatch when signerAddress mismatches owner", async () => {
    const result = await parseInput(
      {
        raw: USDC_PERMIT_JSON,
        signerAddress: "0x0000000000000000000000000000000000000001",
      },
      { ...mockClients(), txLookupEnabled: false, debankEnabled: false },
    );

    expect(result.warnings.some((w) => w.code === "ownerMismatch")).toBe(true);
    expect(result.view?.warnings?.some((w) => w.code === "ownerMismatch")).toBe(true);
  });

  it("fetches token info for USDC permit", async () => {
    const clients = mockClients();
    await parseInput(
      { raw: USDC_PERMIT_JSON },
      { ...clients, txLookupEnabled: false, debankEnabled: false },
    );
    expect(clients.etherscan.getTokenInfo).toHaveBeenCalledWith(1, USDC_TOKEN);
  });
});
