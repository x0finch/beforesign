import { describe, expect, it, vi } from "vitest";
import type { ClientsBundle } from "@beforesign/clients";
import { validateSpec } from "@beforesign/json-render-catalog";
import { buildTxHashSpec } from "../src/build_tx_hash_spec.ts";

function mockClients(overrides?: Partial<ClientsBundle>): ClientsBundle {
  return {
    txLookup: {
      searchQuick: vi.fn(),
      getTransaction: vi.fn(),
    },
    etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
    debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
    signatureLookup: { resolveBySelector: vi.fn() },
    ...overrides,
  };
}

describe("buildTxHashSpec", () => {
  it("builds a valid tx hash spec for resolved tx", async () => {
    const hash = "0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123ab";
    const clients = mockClients({
      txLookup: {
        searchQuick: vi.fn().mockResolvedValue({
          status: "resolved",
          hits: [{ id: "1-hit", chainId: 1, chainName: "Ethereum" }],
          resolvedChainId: 1,
        }),
        getTransaction: vi.fn().mockResolvedValue({
          tx: {
            chainId: 1,
            from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            to: "0x0000000000000000000000000000000000000000",
            value: "0",
            data: "0x",
            hash,
          },
          onchain: { chainId: 1, status: "success" },
        }),
      },
    });

    const result = await buildTxHashSpec({ hash, chainId: 1 }, clients);

    expect(validateSpec(result.spec as never).valid).toBe(true);
    expect(result.summary).toContain("On-chain transaction");
    expect(result.chainId).toBe(1);

    const elements = Object.values(result.spec.elements) as Array<{
      type: string;
      props: { label?: string };
    }>;
    expect(
      elements.some((element) => element.type === "Field" && element.props.label === "Chain"),
    ).toBe(true);
  });
});
