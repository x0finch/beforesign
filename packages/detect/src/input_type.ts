import type { InputKind } from "@beforesign/core";
import type {
  Hash,
  Hex,
  ParseTransactionReturnType,
  TypedDataDefinition,
} from "viem";
import { isHash, isHex } from "viem";
import { normalizeTypedDataFromJson } from "./normalize_typed_data.ts";
import {
  normalizeTxFromJson,
  transactionHasSignature,
  tryNormalizeTxFromHex,
} from "./normalize_tx.ts";

export type TypedDataMatch =
  | { matched: false }
  | { matched: true; normalized: TypedDataDefinition };

export type UnsignedTxNormalized = ParseTransactionReturnType;
export type UnsignedTxMatch =
  | { matched: false }
  | { matched: true; normalized: UnsignedTxNormalized };

export type SignedTxNormalized = ParseTransactionReturnType;
export type SignedTxMatch =
  | { matched: false }
  | { matched: true; normalized: SignedTxNormalized };

export type TxHashMatch =
  | { matched: false }
  | { matched: true; normalized: Hash };

export type CalldataMatch =
  | { matched: false }
  | { matched: true; normalized: Hex };

export type DetectorMatch =
  | TxHashMatch
  | TypedDataMatch
  | SignedTxMatch
  | UnsignedTxMatch
  | CalldataMatch;

export type DetectResult =
  | { kind: "txHash"; normalized: Hash }
  | { kind: "typedData"; normalized: TypedDataDefinition }
  | { kind: "signedTx"; normalized: SignedTxNormalized }
  | { kind: "unsignedTx"; normalized: UnsignedTxNormalized }
  | { kind: "calldata"; normalized: Hex }
  | { kind: "unknown"; normalized: string };

type Detector = {
  kind: InputKind;
  test: (input: string) => DetectorMatch;
};

function isTxJsonCandidate(obj: Record<string, unknown>): boolean {
  const keys = ["from", "to", "data", "chainId", "nonce", "gas", "value"];
  return keys.some((k) => k in obj);
}

function hasSignatureFields(obj: Record<string, unknown>): boolean {
  return (
    ("v" in obj && obj.v != null) ||
    ("r" in obj && obj.r != null) ||
    ("s" in obj && obj.s != null)
  );
}

export function isTxHash(value: string): TxHashMatch {
  const trimmed = value.trim().toLowerCase();
  if (!isHash(trimmed)) {
    return { matched: false };
  }
  return { matched: true, normalized: trimmed as Hash };
}

export function isTypedDataInput(value: string): TypedDataMatch {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { matched: false };
  }
  try {
    return { matched: true, normalized: normalizeTypedDataFromJson(trimmed) };
  } catch {
    return { matched: false };
  }
}

export function isSignedTxJson(value: string): SignedTxMatch {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { matched: false };
  }
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (!isTxJsonCandidate(parsed) || !hasSignatureFields(parsed)) {
      return { matched: false };
    }
    const normalized = normalizeTxFromJson(trimmed);
    if (!transactionHasSignature(normalized)) {
      return { matched: false };
    }
    return { matched: true, normalized };
  } catch {
    return { matched: false };
  }
}

export function isUnsignedTxJson(value: string): UnsignedTxMatch {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return { matched: false };
  }
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (!isTxJsonCandidate(parsed) || hasSignatureFields(parsed)) {
      return { matched: false };
    }
    const normalized = normalizeTxFromJson(trimmed);
    if (transactionHasSignature(normalized)) {
      return { matched: false };
    }
    return { matched: true, normalized };
  } catch {
    return { matched: false };
  }
}

export function isSignedTxHex(value: string): SignedTxMatch {
  const tx = tryNormalizeTxFromHex(value.trim());
  if (tx === null || !transactionHasSignature(tx)) {
    return { matched: false };
  }
  return { matched: true, normalized: tx };
}

export function isUnsignedTxHex(value: string): UnsignedTxMatch {
  const tx = tryNormalizeTxFromHex(value.trim());
  if (tx === null || transactionHasSignature(tx)) {
    return { matched: false };
  }
  return { matched: true, normalized: tx };
}

export function isCalldata(value: string): CalldataMatch {
  const trimmed = value.trim().toLowerCase();
  if (!isHex(trimmed) || trimmed.length < 10 || isHash(trimmed)) {
    return { matched: false };
  }
  return { matched: true, normalized: trimmed as Hex };
}

const DETECTORS: readonly Detector[] = [
  { kind: "txHash", test: isTxHash },
  { kind: "typedData", test: isTypedDataInput },
  { kind: "signedTx", test: isSignedTxJson },
  { kind: "unsignedTx", test: isUnsignedTxJson },
  { kind: "signedTx", test: isSignedTxHex },
  { kind: "unsignedTx", test: isUnsignedTxHex },
  { kind: "calldata", test: isCalldata },
] as const;

export function detectInputType(raw: string): DetectResult {
  const trimmed = raw.trim();
  for (const d of DETECTORS) {
    const match = d.test(trimmed);
    if (match.matched) {
      return {
        kind: d.kind,
        normalized: match.normalized,
      } as DetectResult;
    }
  }
  return { kind: "unknown", normalized: trimmed };
}
