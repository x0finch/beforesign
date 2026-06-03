import type { InputKind } from "@beforesign/core";

const HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export type DetectResult = {
  kind: InputKind;
  normalized: string;
  confidence?: string;
};

function isTypedDataJson(obj: Record<string, unknown>): boolean {
  return (
    typeof obj.domain === "object" &&
    obj.domain !== null &&
    typeof obj.types === "object" &&
    obj.types !== null &&
    typeof obj.message === "object" &&
    obj.message !== null
  );
}

function isTxJson(obj: Record<string, unknown>): boolean {
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

function isTxHash(value: string): boolean {
  return HASH_RE.test(value);
}

function tryClassifyTxHex(raw: string): "signedTx" | "unsignedTx" | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("0x") || trimmed.length <= 66) return null;
  const isRlpTx =
    trimmed.startsWith("0x02f") ||
    trimmed.startsWith("0xf8") ||
    trimmed.startsWith("0x01f") ||
    (trimmed.startsWith("0x02") && trimmed.length > 120);
  if (!isRlpTx) return null;
  return trimmed.length > 220 ? "signedTx" : "unsignedTx";
}

export function detectInputType(raw: string): DetectResult {
  const normalized = raw.trim();

  if (isTxHash(normalized)) {
    return { kind: "txHash", normalized, confidence: "hash" };
  }

  if (normalized.startsWith("{") || normalized.startsWith("[")) {
    try {
      const parsed = JSON.parse(normalized) as Record<string, unknown>;
      if (isTypedDataJson(parsed)) {
        return { kind: "typedData", normalized, confidence: "eip712" };
      }
      if (isTxJson(parsed)) {
        const kind = hasSignatureFields(parsed) ? "signedTx" : "unsignedTx";
        return { kind, normalized, confidence: "json_tx" };
      }
    } catch {
      /* fall through */
    }
  }

  const txKind = tryClassifyTxHex(normalized);
  if (txKind) {
    return { kind: txKind, normalized, confidence: "rlp" };
  }

  if (normalized.startsWith("0x") && normalized.length >= 10) {
    return { kind: "calldata", normalized, confidence: "calldata" };
  }

  return { kind: "unknown", normalized };
}
