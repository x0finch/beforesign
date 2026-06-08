import type { ParseResult, WarningItem } from "@beforesign/core";

const MAX_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const LARGE_VALUE_WEI = BigInt("1000000000000000000");

export function runRiskRules(
  result: ParseResult,
  opts?: { selectedChainId?: number },
): WarningItem[] {
  const warnings: WarningItem[] = [];

  const fn = result.calldata?.functionName?.toLowerCase() ?? "";
  if (fn.includes("approve") || fn.includes("increaseallowance")) {
    const amountArg = result.calldata?.args.find(
      (a) => a.name.includes("amount") || a.type.includes("uint"),
    );
    if (amountArg?.value === MAX_UINT256) {
      warnings.push({
        code: "unlimitedApproval",
        severity: "destructive",
        message: "Unlimited token approval detected",
      });
    }
  }

  if (fn.includes("setapprovalforall")) {
    warnings.push({
      code: "approvalForAll",
      severity: "destructive",
      message: "setApprovalForAll affects all tokens in collection",
    });
  }

  if (result.tx?.value) {
    try {
      if (BigInt(result.tx.value) >= LARGE_VALUE_WEI) {
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

  if (
    opts?.selectedChainId &&
    result.tx?.chainId &&
    opts.selectedChainId !== result.tx.chainId
  ) {
    warnings.push({
      code: "chainMismatch",
      severity: "warning",
      message: "Selected chain does not match transaction chainId",
    });
  }

  if (result.discovery?.status === "notFound") {
    warnings.push({
      code: "txNotIndexed",
      severity: "info",
      message: "Transaction hash not found in Tenderly index",
    });
  }

  if (result.discovery?.status === "ambiguous") {
    warnings.push({
      code: "ambiguousChain",
      severity: "info",
      message: "Multiple chains matched; select the correct one",
    });
  }

  return warnings;
}
