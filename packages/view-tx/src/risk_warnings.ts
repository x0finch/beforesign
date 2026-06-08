import type { NormalizedTx, WarningItem } from "@beforesign/core";

const LARGE_VALUE_WEI = BigInt("1000000000000000000");

export function buildTxRiskWarnings(
  tx: NormalizedTx | undefined,
  opts?: { selectedChainId?: number },
): WarningItem[] {
  const warnings: WarningItem[] = [];

  if (tx?.value) {
    try {
      if (BigInt(tx.value) >= LARGE_VALUE_WEI) {
        warnings.push({
          code: "largeNativeTransfer",
          severity: "warning",
          message: "Large native currency transfer",
        });
      }
    } catch {
      /* ignore */
    }
  }

  if (opts?.selectedChainId && tx?.chainId && opts.selectedChainId !== tx.chainId) {
    warnings.push({
      code: "chainMismatch",
      severity: "warning",
      message: "Selected chain does not match transaction chainId",
    });
  }

  return warnings;
}

export function missingFieldWarnings(missingFields: string[]): WarningItem[] {
  return missingFields.map((field) => ({
    code: "missingField",
    severity: "warning" as const,
    message: `Missing field: ${field}`,
  }));
}

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
