import type { InputKind, JsonValue, ParseResult } from "@beforesign/core";
import { parseCalldata } from "./calldata.ts";
import { normalizeTxJson } from "./normalize_tx_json.ts";
import { parseTypedData } from "./typed_data.ts";
import { buildUnsignedTxHash, parseTxHex } from "./transaction.ts";
import { canSimulateDebank, mergeMissing, missingFieldsForSimulate } from "./simulate.ts";
import type { Abi } from "viem";

export type ParseLocalOpts = {
  abi?: string;
  contractAddress?: string;
};

function parseAbi(raw?: string): Abi | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return JSON.parse(raw) as Abi;
  } catch {
    return undefined;
  }
}

function baseResult(kind: InputKind, summary: string, summaryEn: string): ParseResult {
  return {
    kind,
    summary,
    summaryEn,
    warnings: [],
    raw: null as JsonValue,
  };
}

export function parseLocally(
  kind: InputKind,
  raw: string,
  opts?: ParseLocalOpts,
): ParseResult {
  const abi = parseAbi(opts?.abi);

  if (kind === "unknown") {
    return baseResult(kind, "无法识别输入格式", "Unrecognized input format");
  }

  if (kind === "typedData") {
    const typedData = parseTypedData(raw);
    return {
      ...baseResult(kind, typedData.summary ?? "EIP-712 结构化数据", "EIP-712 typed data"),
      typedData,
      raw: JSON.parse(raw) as JsonValue,
    };
  }

  if (kind === "calldata") {
    const calldata = parseCalldata(raw, { abi, contractAddress: opts?.contractAddress });
    return {
      ...baseResult(kind, calldata.summary ?? "合约 calldata", "Contract calldata"),
      calldata,
      raw: raw,
    };
  }

  if (kind === "txHash") {
    return baseResult(kind, "交易哈希（待查询链上数据）", "Transaction hash (pending lookup)");
  }

  if (kind === "signedTx" || kind === "unsignedTx") {
    let tx;
    let missingFields: string[] = [];
    const trimmed = raw.trim();

    if (trimmed.startsWith("{")) {
      const normalized = normalizeTxJson(trimmed);
      tx = normalized.tx;
      missingFields = normalized.missingFields;
    } else {
      try {
        tx = parseTxHex(trimmed);
      } catch {
        return baseResult(kind, "无法解析交易 hex", "Failed to parse transaction hex");
      }
    }

    if (kind === "unsignedTx" && !tx.hash) {
      tx = { ...tx, hash: buildUnsignedTxHash(tx) };
    }

    let result: ParseResult = {
      ...baseResult(
        kind,
        kind === "signedTx" ? "已签名交易" : "未签名交易",
        kind === "signedTx" ? "Signed transaction" : "Unsigned transaction",
      ),
      tx,
      missingFields,
    };

    if (tx.data) {
      result.calldata = parseCalldata(tx.data, { abi, contractAddress: tx.to });
    }

    if (kind === "unsignedTx") {
      result = mergeMissing(result, missingFieldsForSimulate(tx));
      if (!canSimulateDebank(tx)) {
        result.summary = "未签名交易（信息不足，无法模拟）";
        result.summaryEn = "Unsigned transaction (insufficient fields to simulate)";
      }
    }

    return result;
  }

  return baseResult(kind, "未知类型", "Unknown");
}
