import { describe, expect, it, vi } from "vitest";
import type { ClientsBundle } from "@beforesign/clients";
import { detectInputType } from "@beforesign/detect";
import { SIGNED_TX_HEX } from "./fixtures/inputs.ts";
import { keccak256 } from "viem";
import { buildReview } from "../src/build_review.ts";
import { prepareSignedTx } from "../src/prepare_signed.ts";
import { REVIEW_FIXTURE_CASES } from "./fixtures/index.ts";

function mockClients(): ClientsBundle {
  return {
    txLookup: { searchQuick: vi.fn(), getTransaction: vi.fn() },
    etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
    debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
  };
}

describe.each(REVIEW_FIXTURE_CASES)("$name", (fixture) => {
  it("matches golden ReviewDocument", async () => {
    const detected = detectInputType(fixture.input);
    expect(detected.kind).toBe(fixture.kind);
    if (detected.kind !== "signedTx" && detected.kind !== "unsignedTx") {
      throw new Error(`unexpected kind ${detected.kind}`);
    }
    const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);
    expect(doc).toEqual(fixture.output);
  });
});

describe("buildReview", () => {
  it("uses default group and Transaction title", async () => {
    const fixture = REVIEW_FIXTURE_CASES[0]!;
    const detected = detectInputType(fixture.input);
    if (detected.kind !== "signedTx") throw new Error("expected signedTx");
    const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);
    expect(doc.title).toBe("Transaction");
    expect(doc.checks.every((c) => c.group === "default")).toBe(true);
    expect(doc.facts).toBeUndefined();
  });

  it("shows chain badge and from for signed tx", async () => {
    const fixture = REVIEW_FIXTURE_CASES[0]!;
    const detected = detectInputType(fixture.input);
    if (detected.kind !== "signedTx") throw new Error("expected signedTx");
    const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);

    const chain = doc.checks.find((c) => c.id === "transaction.chain");
    expect(chain?.badge).toBe("13579024");
    expect(chain?.badgeVariant).toBe("success");
    expect(doc.checks.some((c) => c.id === "transaction.from")).toBe(true);
    expect(doc.checks.some((c) => c.id === "transaction.data")).toBe(true);
  });

  it("omits from and badge for unsigned tx", async () => {
    const fixture = REVIEW_FIXTURE_CASES.find((f) => f.name === "unsignedTx")!;
    const detected = detectInputType(fixture.input);
    if (detected.kind !== "unsignedTx") throw new Error("expected unsignedTx");
    const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);

    const chain = doc.checks.find((c) => c.id === "transaction.chain");
    expect(chain?.badge).toBeUndefined();
    expect(chain?.href).toBeUndefined();
    expect(doc.checks.some((c) => c.id === "transaction.from")).toBe(false);
    expect(doc.checks.some((c) => c.id === "transaction.data")).toBe(true);
  });

  it("does not call txLookup for unsigned hex", async () => {
    const fixture = REVIEW_FIXTURE_CASES.find((f) => f.name === "unsignedTxHex")!;
    const detected = detectInputType(fixture.input);
    if (detected.kind !== "unsignedTx") throw new Error("expected unsignedTx");
    const clients = mockClients();

    await buildReview(detected.normalized, clients, fixture.payload);

    expect(clients.txLookup.searchQuick).not.toHaveBeenCalled();
    expect(clients.txLookup.getTransaction).not.toHaveBeenCalled();
  });

  it("shows data hash and function for unsigned calldata without from", async () => {
    const fixture = REVIEW_FIXTURE_CASES.find((f) => f.name === "unsignedWithCalldata")!;
    const detected = detectInputType(fixture.input);
    if (detected.kind !== "unsignedTx") throw new Error("expected unsignedTx");
    const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);

    expect(doc.checks.some((c) => c.id === "transaction.from")).toBe(false);
    expect(doc.checks.find((c) => c.id === "transaction.data")?.kind).toBe("hash");
    expect(doc.checks.find((c) => c.id === "calldata.function")?.value).toBe(
      "transfer(address,uint256)",
    );
  });

  it("omits chain row for unsigned json without chainId", async () => {
    const fixture = REVIEW_FIXTURE_CASES.find((f) => f.name === "unsignedTxNoChainId")!;
    const detected = detectInputType(fixture.input);
    if (detected.kind !== "unsignedTx") throw new Error("expected unsignedTx");
    const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);

    expect(doc.checks.some((c) => c.id === "transaction.chain")).toBe(false);
    expect(doc.checks.some((c) => c.id === "transaction.to")).toBe(true);
    expect(doc.checks.some((c) => c.id === "transaction.data")).toBe(true);
  });

  it("shows to and hash data for unsigned json with to and data only", async () => {
    const fixture = REVIEW_FIXTURE_CASES.find((f) => f.name === "unsignedTxToDataOnly")!;
    const detected = detectInputType(fixture.input);
    if (detected.kind !== "unsignedTx") throw new Error("expected unsignedTx");
    const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);

    expect(doc.checks.some((c) => c.id === "transaction.chain")).toBe(false);
    expect(doc.checks.find((c) => c.id === "transaction.data")?.kind).toBe("hash");
  });
});

describe("prepareSignedTx", () => {
  it("looks up tx hash and recovers from address", async () => {
    const detected = detectInputType(SIGNED_TX_HEX);
    if (detected.kind !== "signedTx") throw new Error("expected signedTx");

    const hash = keccak256(SIGNED_TX_HEX);
    const clients = mockClients();
    vi.mocked(clients.txLookup.searchQuick).mockResolvedValue({
      status: "resolved",
      hits: [{ id: `1-${hash}`, chainId: 1, chainName: "Ethereum" }],
      resolvedChainId: 1,
    });
    vi.mocked(clients.txLookup.getTransaction).mockResolvedValue({
      tx: {
        chainId: 1,
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        data: "0x",
        hash,
      },
      onchain: {
        chainId: 1,
        blockNumber: "999",
        status: "success",
      },
    });

    const prepared = await prepareSignedTx(detected.normalized, clients);
    expect(prepared.tx.hash).toBe(hash);
    expect(prepared.tx.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    expect(prepared.indexed).toBe("found");
    expect(prepared.onchain?.blockNumber).toBe("999");
    expect(clients.txLookup.searchQuick).toHaveBeenCalledWith(hash);
  });
});
