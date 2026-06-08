import type { InputKind, JsonValue, ParseResult } from "@beforesign/core";
import { parseInputObject, type DetectResult } from "@beforesign/detect";
import type { Abi } from "viem";
import {
  canSimulateDebank,
  mergeMissing,
  missingFieldsForSimulate,
} from "./simulate.ts";
import { normalizeTxJson } from "./tx_json.ts";
import { buildUnsignedTxHash, viemTxToNormalized } from "./viem_tx.ts";

function baseResult(kind: InputKind, summary: string, summaryEn: string): ParseResult {
  return {
    kind,
    summary,
    summaryEn,
    warnings: [],
    raw: null as JsonValue,
  };
}

export function buildParseResult(
  detected: DetectResult,
  raw: string,
): ParseResult {
  const { kind } = detected;

  if (kind === "unknown") {
    return { ...baseResult(kind, "无法识别输入格式", "Unrecognized input format"), raw };
  }

  if (kind === "typedData") {
    return {
      ...baseResult(kind, "EIP-712 结构化数据", "EIP-712 typed data"),
      raw: parseInputObject(raw) as JsonValue,
    };
  }

  if (kind === "calldata") {
    return {
      ...baseResult(kind, "合约 calldata", "Contract calldata"),
      raw,
    };
  }

  if (kind === "txHash") {
    return {
      ...baseResult(kind, "交易哈希（待查询链上数据）", "Transaction hash (pending lookup)"),
      raw,
    };
  }

  if (kind === "signedTx" || kind === "unsignedTx") {
    const trimmed = raw.trim();
    let tx;
    let missingFields: string[] = [];

    if (trimmed.startsWith("{")) {
      const normalized = normalizeTxJson(trimmed);
      tx = normalized.tx;
      missingFields = normalized.missingFields;
    } else {
      tx = viemTxToNormalized(detected.normalized, { serializedHex: trimmed });
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
      raw: trimmed.startsWith("{") ? (parseInputObject(trimmed) as JsonValue) : trimmed,
    };

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
