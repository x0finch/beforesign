import type { input_kind, parse_result } from "@beforesign/core";
import type { locale } from "./i18n.ts";

const kind_labels: Record<locale, Record<input_kind, string>> = {
  zh: {
    tx_hash: "交易哈希",
    signed_tx: "已签名交易",
    unsigned_tx: "未签名交易",
    calldata: "Calldata",
    typed_data: "EIP-712",
    unknown: "未知",
  },
  en: {
    tx_hash: "Tx hash",
    signed_tx: "Signed tx",
    unsigned_tx: "Unsigned tx",
    calldata: "Calldata",
    typed_data: "EIP-712",
    unknown: "Unknown",
  },
};

export function kind_label(locale: locale, kind: input_kind): string {
  return kind_labels[locale][kind];
}

export function display_summary(result: parse_result, locale: locale): string {
  if (locale === "en" && result.summary_en) return result.summary_en;
  return result.summary;
}
