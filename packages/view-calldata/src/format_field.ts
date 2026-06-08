import type { FieldKind } from "@beforesign/json-render-catalog";

export const MAX_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export function kindForArgType(type: string): "address" | "amount" | "text" | "hash" {
  if (type.includes("address")) return "address";
  if (type.includes("uint") || type.includes("int")) return "amount";
  if (type === "bytes" || type.startsWith("bytes")) return "hash";
  return "text";
}

export function fieldPresentation(kind: FieldKind | null): { mono: boolean; clamp: boolean } {
  switch (kind) {
    case "address":
    case "selector":
      return { mono: true, clamp: false };
    case "hash":
      return { mono: true, clamp: true };
    default:
      return { mono: false, clamp: false };
  }
}
