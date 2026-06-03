import type { NormalizedTx, ParseResult } from "@beforesign/core";

export function canSimulateDebank(tx: NormalizedTx | undefined): boolean {
  if (!tx) return false;
  if (!tx.chainId || !tx.from) return false;
  if (!tx.to && !tx.data) return false;
  return true;
}

export function missingFieldsForSimulate(tx: NormalizedTx | undefined): string[] {
  const missing: string[] = [];
  if (!tx?.chainId) missing.push("chainId");
  if (!tx?.from) missing.push("from");
  if (!tx?.to && !tx?.data) missing.push("toOrData");
  return missing;
}

export function mergeMissing(result: ParseResult, extra: string[]): ParseResult {
  const set = new Set([...(result.missingFields ?? []), ...extra]);
  return { ...result, missingFields: [...set] };
}
