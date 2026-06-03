import type { input_kind } from "@beforesign/core";

const HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export type detect_result = {
  kind: input_kind;
  normalized: string;
  confidence?: string;
};

function is_typed_data_json(obj: Record<string, unknown>): boolean {
  return (
    typeof obj.domain === "object" &&
    obj.domain !== null &&
    typeof obj.types === "object" &&
    obj.types !== null &&
    typeof obj.message === "object" &&
    obj.message !== null
  );
}

function is_tx_json(obj: Record<string, unknown>): boolean {
  const keys = ["from", "to", "data", "chainId", "nonce", "gas", "value"];
  return keys.some((k) => k in obj);
}

function has_signature_fields(obj: Record<string, unknown>): boolean {
  return (
    ("v" in obj && obj.v != null) ||
    ("r" in obj && obj.r != null) ||
    ("s" in obj && obj.s != null)
  );
}

function is_tx_hash(value: string): boolean {
  return HASH_RE.test(value);
}

function try_classify_tx_hex(raw: string): "signed_tx" | "unsigned_tx" | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("0x") || trimmed.length <= 66) return null;
  const is_rlp_tx =
    trimmed.startsWith("0x02f") ||
    trimmed.startsWith("0xf8") ||
    trimmed.startsWith("0x01f") ||
    (trimmed.startsWith("0x02") && trimmed.length > 120);
  if (!is_rlp_tx) return null;
  return trimmed.length > 220 ? "signed_tx" : "unsigned_tx";
}

export function detect_input_type(raw: string): detect_result {
  const normalized = raw.trim();

  if (is_tx_hash(normalized)) {
    return { kind: "tx_hash", normalized, confidence: "hash" };
  }

  if (normalized.startsWith("{") || normalized.startsWith("[")) {
    try {
      const parsed = JSON.parse(normalized) as Record<string, unknown>;
      if (is_typed_data_json(parsed)) {
        return { kind: "typed_data", normalized, confidence: "eip712" };
      }
      if (is_tx_json(parsed)) {
        const kind = has_signature_fields(parsed) ? "signed_tx" : "unsigned_tx";
        return { kind, normalized, confidence: "json_tx" };
      }
    } catch {
      /* fall through */
    }
  }

  const tx_kind = try_classify_tx_hex(normalized);
  if (tx_kind) {
    return { kind: tx_kind, normalized, confidence: "rlp" };
  }

  if (normalized.startsWith("0x") && normalized.length >= 10) {
    return { kind: "calldata", normalized, confidence: "calldata" };
  }

  return { kind: "unknown", normalized };
}
