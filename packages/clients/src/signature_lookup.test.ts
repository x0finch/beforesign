import { describe, expect, it, vi } from "vitest";
import {
  createSignatureLookupClient,
  pickFourByteSignature,
} from "./signature_lookup.ts";

const TRANSFER_DEDAUB = [
  {
    selector: "0xa9059cbb",
    signature: "transfer(address,uint256)",
    name: "transfer",
    inputs: [
      { name: "recipient", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    type: "function",
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
    payable: null,
    constant: null,
  },
];

describe("pickFourByteSignature", () => {
  it("picks the shortest signature, then lowest id", () => {
    const picked = pickFourByteSignature([
      { id: 1111734, text_signature: "workMyDirefulOwner(uint256,uint256)" },
      { id: 145, text_signature: "transfer(address,uint256)" },
    ]);
    expect(picked).toBe("transfer(address,uint256)");
  });
});

describe("createSignatureLookupClient", () => {
  it("parses Dedaub responses into Abi", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(TRANSFER_DEDAUB), { status: 200 }),
    );
    const client = createSignatureLookupClient({ fetchFn, minIntervalMs: 0 });

    const abi = await client.resolveBySelector("0xa9059cbb");
    expect(abi?.[0]).toMatchObject({
      name: "transfer",
      type: "function",
      inputs: [
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" },
      ],
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("falls back to 4byte when Dedaub fails", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(new Response("<!DOCTYPE html>", { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [{ id: 145, text_signature: "transfer(address,uint256)" }],
          }),
          { status: 200 },
        ),
      );

    const client = createSignatureLookupClient({ fetchFn, minIntervalMs: 0 });
    const abi = await client.resolveBySelector("0xa9059cbb");

    expect(abi?.[0]).toMatchObject({
      name: "transfer",
      type: "function",
      inputs: [{ type: "address" }, { type: "uint256" }],
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("deduplicates concurrent lookups for the same selector", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchFn = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const client = createSignatureLookupClient({ fetchFn, minIntervalMs: 0 });
    const first = client.resolveBySelector("0xa9059cbb");
    const second = client.resolveBySelector("0xa9059cbb");
    await Promise.resolve();
    resolveFetch(new Response(JSON.stringify(TRANSFER_DEDAUB), { status: 200 }));
    await Promise.all([first, second]);

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
