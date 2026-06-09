import type { InputKind, JsonValue } from "@beforesign/core";
import { parseInputObject } from "@beforesign/detect";

const PLACEHOLDER_ZH: Record<InputKind, string> = {
  txHash: "交易哈希（待查询链上数据）",
  signedTx: "已签名交易",
  unsignedTx: "未签名交易",
  calldata: "合约 calldata",
  typedData: "EIP-712 结构化数据",
  unknown: "无法识别输入格式",
};

const PLACEHOLDER_EN: Record<InputKind, string> = {
  txHash: "Transaction hash (pending lookup)",
  signedTx: "Signed transaction",
  unsignedTx: "Unsigned transaction",
  calldata: "Contract calldata",
  typedData: "EIP-712 typed data",
  unknown: "Unrecognized input format",
};

export function placeholderSummary(kind: InputKind): string {
  return PLACEHOLDER_ZH[kind];
}

export function placeholderSummaryEn(kind: InputKind): string {
  return PLACEHOLDER_EN[kind];
}

export function rawForKind(kind: InputKind, raw: string): JsonValue {
  if (
    kind === "typedData" ||
    ((kind === "signedTx" || kind === "unsignedTx") && raw.trim().startsWith("{"))
  ) {
    return parseInputObject(raw) as JsonValue;
  }
  return raw;
}
