import type { WarningItem } from "@beforesign/core";

export function mergeWarnings(
  existing: WarningItem[],
  incoming: WarningItem[],
): WarningItem[] {
  const codes = new Set(existing.map((w) => w.code));
  const merged = [...existing];
  for (const warning of incoming) {
    if (!codes.has(warning.code)) {
      merged.push(warning);
      codes.add(warning.code);
    }
  }
  return merged;
}
