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
        message: "检测到无限授权，请谨慎确认",
        messageEn: "Unlimited token approval detected",
      });
    }
  }

  if (fn.includes("setapprovalforall")) {
    warnings.push({
      code: "approvalForAll",
      severity: "destructive",
      message: "检测到 setApprovalForAll，将影响该合集下全部 NFT",
      messageEn: "setApprovalForAll affects all tokens in collection",
    });
  }

  if (result.tx?.value) {
    try {
      if (BigInt(result.tx.value) >= LARGE_VALUE_WEI) {
        warnings.push({
          code: "largeNativeTransfer",
          severity: "warning",
          message: "原生代币转账金额较大",
          messageEn: "Large native currency transfer",
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
      message: "所选链与交易 chainId 不一致",
      messageEn: "Selected chain does not match transaction chainId",
    });
  }

  if (result.discovery?.status === "notFound") {
    warnings.push({
      code: "txNotIndexed",
      severity: "info",
      message: "未在 Blockscout 索引中找到该哈希，请手动选择链",
      messageEn: "Transaction hash not found in Blockscout index",
    });
  }

  if (result.discovery?.status === "ambiguous") {
    warnings.push({
      code: "ambiguousChain",
      severity: "info",
      message: "多条链上存在匹配，请选择正确链",
      messageEn: "Multiple chains matched; select the correct one",
    });
  }

  return warnings;
}
