import type { InputKind, ParseResult } from "@beforesign/core";
import type { Locale } from "./i18n.ts";

const kindLabels: Record<Locale, Record<InputKind, string>> = {
  zh: {
    txHash: "交易哈希",
    signedTx: "已签名交易",
    unsignedTx: "未签名交易",
    calldata: "Calldata",
    typedData: "EIP-712",
    unknown: "未知",
  },
  en: {
    txHash: "Tx hash",
    signedTx: "Signed tx",
    unsignedTx: "Unsigned tx",
    calldata: "Calldata",
    typedData: "EIP-712",
    unknown: "Unknown",
  },
};

export function kindLabel(locale: Locale, kind: InputKind): string {
  return kindLabels[locale][kind];
}

export function displaySummary(result: ParseResult, locale: Locale): string {
  if (locale === "en" && result.summaryEn) return result.summaryEn;
  return result.summary;
}
