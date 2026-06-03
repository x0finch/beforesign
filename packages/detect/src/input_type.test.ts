import {
  CALLDATA_HEX,
  METAMASK_UNSIGNED_JSON,
  SIGNED_TX_HEX,
  SIGNED_TX_JSON,
  TX_HASH,
  TYPED_DATA_JSON,
  UNSIGNED_TX_HEX,
} from "@beforesign/test-fixtures";
import { validateTypedData } from "viem";
import { describe, expect, it } from "vitest";
import { detectInputType } from "./input_type.ts";
import { transactionHasSignature } from "./normalize_tx.ts";
import { normalizeTypedDataFromJson } from "./normalize_typed_data.ts";

describe("detectInputType", () => {
  it.each([
    { input: TX_HASH, kind: "txHash" },
    { input: TYPED_DATA_JSON, kind: "typedData" },
    { input: METAMASK_UNSIGNED_JSON, kind: "unsignedTx" },
    { input: UNSIGNED_TX_HEX, kind: "unsignedTx" },
    { input: SIGNED_TX_JSON, kind: "signedTx" },
    { input: SIGNED_TX_HEX, kind: "signedTx" },
    { input: CALLDATA_HEX, kind: "calldata" },
  ])("classifies $kind", ({ input, kind }) => {
    const result = detectInputType(input);
    expect(result.kind).toBe(kind);
  });

  it("normalizes tx hash to lowercase Hash", () => {
    const upper = TX_HASH.toUpperCase();
    const result = detectInputType(upper);
    expect(result.kind).toBe("txHash");
    if (result.kind === "txHash") {
      expect(result.normalized).toBe(TX_HASH);
    }
  });

  it("normalizes typed data via viem round-trip", () => {
    const result = detectInputType(TYPED_DATA_JSON);
    expect(result.kind).toBe("typedData");
    if (result.kind !== "typedData") return;

    const expected = normalizeTypedDataFromJson(TYPED_DATA_JSON);
    expect(result.normalized).toEqual(expected);
    expect(result.normalized.primaryType).toBe("Permit");
    expect(result.normalized.message.owner).toBe(
      "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
    );
    expect(() => validateTypedData(result.normalized)).not.toThrow();
  });

  it("normalizes unsigned tx json and hex to viem transaction objects", () => {
    const fromJson = detectInputType(METAMASK_UNSIGNED_JSON);
    const fromHex = detectInputType(UNSIGNED_TX_HEX);
    expect(fromJson.kind).toBe("unsignedTx");
    expect(fromHex.kind).toBe("unsignedTx");
    if (fromJson.kind !== "unsignedTx" || fromHex.kind !== "unsignedTx") return;

    expect(transactionHasSignature(fromJson.normalized)).toBe(false);
    expect(transactionHasSignature(fromHex.normalized)).toBe(false);
    expect(fromJson.normalized.chainId).toBe(1);
    expect(fromHex.normalized.chainId).toBe(1);
    expect(fromJson.normalized.type).toBe("eip1559");
    expect(fromHex.normalized.type).toBe("eip1559");
  });

  it("normalizes signed tx json and hex with signature fields", () => {
    const fromJson = detectInputType(SIGNED_TX_JSON);
    const fromHex = detectInputType(SIGNED_TX_HEX);
    expect(fromJson.kind).toBe("signedTx");
    expect(fromHex.kind).toBe("signedTx");
    if (fromJson.kind !== "signedTx" || fromHex.kind !== "signedTx") return;

    expect(transactionHasSignature(fromJson.normalized)).toBe(true);
    expect(transactionHasSignature(fromHex.normalized)).toBe(true);
    expect(fromJson.normalized.chainId).toBe(1);
    expect(fromHex.normalized.chainId).toBe(1);
  });

  it("normalizes calldata to lowercase Hex", () => {
    const result = detectInputType(CALLDATA_HEX.toUpperCase());
    expect(result.kind).toBe("calldata");
    if (result.kind === "calldata") {
      expect(result.normalized).toBe(CALLDATA_HEX);
    }
  });

  it("does not classify unsigned tx hex as calldata", () => {
    expect(detectInputType(UNSIGNED_TX_HEX).kind).not.toBe("calldata");
  });

  it("classifies unknown input", () => {
    const result = detectInputType("hello");
    expect(result.kind).toBe("unknown");
    if (result.kind === "unknown") {
      expect(result.normalized).toBe("hello");
    }
  });
});
