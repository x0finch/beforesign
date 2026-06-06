import { describe, expect, it, vi } from "vitest";
import type { ClientsBundle } from "@beforesign/clients";
import {
  CALLDATA_HEX,
  TENDERLY_SEARCH_SINGLE,
  TX_HASH,
} from "@beforesign/test-fixtures";
import { buildReview } from "../src/build_review.ts";
import { prepareTxHash } from "../src/prepare_tx_hash.ts";
import { REVIEW_FIXTURE_CASES } from "./fixtures/index.ts";

function mockClients(): ClientsBundle {
  return {
    txLookup: {
      searchQuick: vi.fn().mockResolvedValue({
        status: "resolved",
        hits: [{ id: "1", chainId: 1, chainName: "Ethereum" }],
        resolvedChainId: 1,
      }),
      getTransaction: vi.fn().mockResolvedValue({
        tx: {
          chainId: 1,
          from: "0xabc",
          to: "0xdef",
          value: "1000",
          data: CALLDATA_HEX,
          hash: TX_HASH,
        },
        onchain: { chainId: 1, status: "success" },
        decodedMethod: "transfer(address,uint256)",
      }),
    },
    etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
    debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
  };
}

describe.each(REVIEW_FIXTURE_CASES)("$name", (fixture) => {
  it("matches golden ReviewDocument", async () => {
    const doc = await buildReview(fixture.hash, mockClients(), fixture.payload);
    expect(doc).toEqual(fixture.output);
  });
});

describe("buildReview", () => {
  it("fetches via Tenderly when payload is not enriched", async () => {
    const clients = mockClients();
    await buildReview(TX_HASH, clients);

    expect(clients.txLookup.searchQuick).toHaveBeenCalledWith(TX_HASH);
    expect(clients.txLookup.getTransaction).toHaveBeenCalledWith(1, TX_HASH);
    expect(clients.etherscan.getTransaction).not.toHaveBeenCalled();
    expect(clients.etherscan.getTokenInfo).not.toHaveBeenCalled();
  });

  it("skips Tenderly when payload is fully prepared", async () => {
    const clients = mockClients();
    const fixture = REVIEW_FIXTURE_CASES[0]!;
    await buildReview(fixture.hash, clients, fixture.payload);

    expect(clients.txLookup.searchQuick).not.toHaveBeenCalled();
    expect(clients.txLookup.getTransaction).not.toHaveBeenCalled();
  });
});

describe("prepareTxHash", () => {
  it("calls searchQuick then getTransaction for unresolved hash", async () => {
    const clients = mockClients();
    vi.mocked(clients.txLookup.searchQuick).mockResolvedValue({
      status: "resolved",
      hits: [
        {
          id: "1-hit",
          chainId: 1,
          chainName: "Ethereum",
        },
      ],
      resolvedChainId: 1,
    });
    vi.mocked(clients.txLookup.getTransaction).mockResolvedValue({
      tx: {
        chainId: 1,
        from: TENDERLY_SEARCH_SINGLE.transactions[0]!.from,
        to: TENDERLY_SEARCH_SINGLE.transactions[0]!.to,
        data: CALLDATA_HEX,
        hash: TX_HASH,
      },
      onchain: { chainId: 1, status: "success" },
      decodedMethod: "transfer(address,uint256)",
    });

    const prepared = await prepareTxHash(TX_HASH, clients);
    expect(prepared.discovery.status).toBe("resolved");
    expect(prepared.tx?.data).toBe(CALLDATA_HEX);
    expect(prepared.decodedMethod).toBe("transfer(address,uint256)");
  });
});
