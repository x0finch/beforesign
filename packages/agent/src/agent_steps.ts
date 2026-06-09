import type { InputKind } from "@beforesign/core";
import type { AgentStepKey, AgentStepStatus, AskLocale } from "./types.ts";

const inputKindLabels: Record<AskLocale, Record<InputKind, string>> = {
  zh: {
    txHash: "交易哈希",
    signedTx: "已签名交易",
    unsignedTx: "未签名交易",
    calldata: "Calldata",
    typedData: "EIP-712 签名数据",
    unknown: "未知",
  },
  en: {
    txHash: "Transaction hash",
    signedTx: "Signed transaction",
    unsignedTx: "Unsigned transaction",
    calldata: "Calldata",
    typedData: "EIP-712 typed data",
    unknown: "Unknown",
  },
};

export function formatInputKind(kind: InputKind, locale: AskLocale): string {
  return inputKindLabels[locale][kind] ?? kind;
}

export function stepLabel(
  key: AgentStepKey,
  locale: AskLocale,
  status: AgentStepStatus,
  detail?: string,
): string {
  const zh = locale === "zh";

  if (key === "think") {
    if (status === "running") return zh ? "思考中…" : "Thinking…";
    if (status === "error") return zh ? "启动失败" : "Failed to start";
    return zh ? "已开始分析" : "Analysis started";
  }

  if (key === "detect") {
    if (status === "running") return zh ? "识别输入类型…" : "Detecting input type…";
    if (status === "error") return zh ? "无法识别输入类型" : "Could not detect input type";
    if (detail) {
      const label = formatInputKind(detail as InputKind, locale);
      return zh ? `识别为：${label} (${detail})` : `Detected: ${label} (${detail})`;
    }
    return zh ? "类型识别完成" : "Type detected";
  }

  if (key === "parse") {
    if (status === "running") return zh ? "解析并构建审查视图…" : "Building review view…";
    if (status === "error") return zh ? "解析失败" : "Parse failed";
    if (detail) {
      return zh ? `解析完成：${detail}` : `Parsed: ${detail}`;
    }
    return zh ? "解析完成" : "Parse complete";
  }

  if (key === "context") {
    if (status === "running") return zh ? "读取会话上下文…" : "Reading session context…";
    if (status === "error") return zh ? "读取上下文失败" : "Failed to read context";
    return zh ? "上下文已就绪" : "Context ready";
  }

  if (key === "explain") {
    if (status === "running") return zh ? "生成解读…" : "Generating explanation…";
    if (status === "error") return zh ? "解读生成失败" : "Explanation failed";
    return zh ? "解读完成" : "Explanation ready";
  }

  return detail ?? key;
}

export function buildStepEvent(
  key: AgentStepKey,
  locale: AskLocale,
  status: AgentStepStatus,
  detail?: string,
) {
  return {
    type: "step" as const,
    key,
    status,
    label: stepLabel(key, locale, status, detail),
    ...(detail !== undefined ? { detail } : {}),
  };
}
