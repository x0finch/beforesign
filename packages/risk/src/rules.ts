import type { parse_result, warning_item } from "@beforesign/core";

const MAX_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const LARGE_VALUE_WEI = BigInt("1000000000000000000");

export function run_risk_rules(
  result: parse_result,
  opts?: { selected_chain_id?: number },
): warning_item[] {
  const warnings: warning_item[] = [];

  const fn = result.calldata?.function_name?.toLowerCase() ?? "";
  if (fn.includes("approve") || fn.includes("increaseallowance")) {
    const amount_arg = result.calldata?.args.find(
      (a) => a.name.includes("amount") || a.type.includes("uint"),
    );
    if (amount_arg?.value === MAX_UINT256) {
      warnings.push({
        code: "unlimited_approval",
        severity: "destructive",
        message: "检测到无限授权，请谨慎确认",
        message_en: "Unlimited token approval detected",
      });
    }
  }

  if (fn.includes("setapprovalforall")) {
    warnings.push({
      code: "approval_for_all",
      severity: "destructive",
      message: "检测到 setApprovalForAll，将影响该合集下全部 NFT",
      message_en: "setApprovalForAll affects all tokens in collection",
    });
  }

  if (result.tx?.value) {
    try {
      if (BigInt(result.tx.value) >= LARGE_VALUE_WEI) {
        warnings.push({
          code: "large_native_transfer",
          severity: "warning",
          message: "原生代币转账金额较大",
          message_en: "Large native currency transfer",
        });
      }
    } catch {
      /* ignore */
    }
  }

  if (
    opts?.selected_chain_id &&
    result.tx?.chain_id &&
    opts.selected_chain_id !== result.tx.chain_id
  ) {
    warnings.push({
      code: "chain_mismatch",
      severity: "warning",
      message: "所选链与交易 chainId 不一致",
      message_en: "Selected chain does not match transaction chainId",
    });
  }

  if (result.discovery?.status === "not_found") {
    warnings.push({
      code: "tx_not_indexed",
      severity: "info",
      message: "未在 Blockscout 索引中找到该哈希，请手动选择链",
      message_en: "Transaction hash not found in Blockscout index",
    });
  }

  if (result.discovery?.status === "ambiguous") {
    warnings.push({
      code: "ambiguous_chain",
      severity: "info",
      message: "多条链上存在匹配，请选择正确链",
      message_en: "Multiple chains matched; select the correct one",
    });
  }

  return warnings;
}
