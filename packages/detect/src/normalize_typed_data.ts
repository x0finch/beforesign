import type { TypedDataDefinition } from "viem";
import { serializeTypedData, validateTypedData } from "viem";

function isTypedDataCandidate(obj: Record<string, unknown>): boolean {
  return (
    typeof obj.domain === "object" &&
    obj.domain !== null &&
    typeof obj.types === "object" &&
    obj.types !== null &&
    typeof obj.message === "object" &&
    obj.message !== null &&
    typeof obj.primaryType === "string"
  );
}

export function normalizeTypedDataFromJson(raw: string): TypedDataDefinition {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  if (!isTypedDataCandidate(parsed)) {
    throw new Error("Not EIP-712 typed data");
  }
  const params = parsed as TypedDataDefinition;
  validateTypedData(params);
  const canonical = serializeTypedData(params);
  return JSON.parse(canonical) as TypedDataDefinition;
}
