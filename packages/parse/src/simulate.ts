import type { normalized_tx, parse_result } from "@beforesign/core";

export function can_simulate_debank(tx: normalized_tx | undefined): boolean {
  if (!tx) return false;
  if (!tx.chain_id || !tx.from) return false;
  if (!tx.to && !tx.data) return false;
  return true;
}

export function missing_fields_for_simulate(tx: normalized_tx | undefined): string[] {
  const missing: string[] = [];
  if (!tx?.chain_id) missing.push("chain_id");
  if (!tx?.from) missing.push("from");
  if (!tx?.to && !tx?.data) missing.push("to_or_data");
  return missing;
}

export function merge_missing(
  result: parse_result,
  extra: string[],
): parse_result {
  const set = new Set([...(result.missing_fields ?? []), ...extra]);
  return { ...result, missing_fields: [...set] };
}
