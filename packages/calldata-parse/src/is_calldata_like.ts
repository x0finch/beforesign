import { isHex } from "viem";

export function isCalldataLike(value: unknown): value is `0x${string}` {
  if (typeof value !== "string" || !isHex(value)) return false;
  if (value.length < 10) return false;
  return true;
}
