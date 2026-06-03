import type { input_kind, json_value, parse_result } from "@beforesign/core";
import { parse_calldata } from "./calldata.ts";
import { normalize_tx_json } from "./normalize_tx_json.ts";
import { parse_typed_data } from "./typed_data.ts";
import { build_unsigned_tx_hash, parse_tx_hex } from "./transaction.ts";
import {
  can_simulate_debank,
  merge_missing,
  missing_fields_for_simulate,
} from "./simulate.ts";
import type { Abi } from "viem";

export type parse_local_opts = {
  abi?: string;
  contract_address?: string;
};

function parse_abi(raw?: string): Abi | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return JSON.parse(raw) as Abi;
  } catch {
    return undefined;
  }
}

function base_result(kind: input_kind, summary: string, summary_en: string): parse_result {
  return {
    kind,
    summary,
    summary_en,
    warnings: [],
    raw: null as json_value,
  };
}

export function parse_locally(
  kind: input_kind,
  raw: string,
  opts?: parse_local_opts,
): parse_result {
  const abi = parse_abi(opts?.abi);

  if (kind === "unknown") {
    return base_result(
      kind,
      "无法识别输入格式",
      "Unrecognized input format",
    );
  }

  if (kind === "typed_data") {
    const typed_data = parse_typed_data(raw);
    return {
      ...base_result(kind, typed_data.summary ?? "EIP-712 结构化数据", "EIP-712 typed data"),
      typed_data,
      raw: JSON.parse(raw) as json_value,
    };
  }

  if (kind === "calldata") {
    const calldata = parse_calldata(raw, { abi, contract_address: opts?.contract_address });
    return {
      ...base_result(kind, calldata.summary ?? "合约 calldata", "Contract calldata"),
      calldata,
      raw: raw,
    };
  }

  if (kind === "tx_hash") {
    return base_result(kind, "交易哈希（待查询链上数据）", "Transaction hash (pending lookup)");
  }

  if (kind === "signed_tx" || kind === "unsigned_tx") {
    let tx;
    let missing_fields: string[] = [];
    const trimmed = raw.trim();

    if (trimmed.startsWith("{")) {
      const normalized = normalize_tx_json(trimmed);
      tx = normalized.tx;
      missing_fields = normalized.missing_fields;
    } else {
      try {
        tx = parse_tx_hex(trimmed);
      } catch {
        return base_result(kind, "无法解析交易 hex", "Failed to parse transaction hex");
      }
    }

    if (kind === "unsigned_tx" && !tx.hash) {
      tx = { ...tx, hash: build_unsigned_tx_hash(tx) };
    }

    let result: parse_result = {
      ...base_result(
        kind,
        kind === "signed_tx" ? "已签名交易" : "未签名交易",
        kind === "signed_tx" ? "Signed transaction" : "Unsigned transaction",
      ),
      tx,
      missing_fields,
    };

    if (tx.data) {
      result.calldata = parse_calldata(tx.data, { abi, contract_address: tx.to });
    }

    if (kind === "unsigned_tx") {
      result = merge_missing(result, missing_fields_for_simulate(tx));
      if (!can_simulate_debank(tx)) {
        result.summary = "未签名交易（信息不足，无法模拟）";
        result.summary_en = "Unsigned transaction (insufficient fields to simulate)";
      }
    }

    return result;
  }

  return base_result(kind, "未知类型", "Unknown");
}
