export type Locale = "zh" | "en";

const messages = {
  zh: {
    tagline: "签名之前，先看懂",
    parse: "解析",
    clear: "清空",
    chainOptional: "链（可选）",
    chainRequired: "链（必选）",
    advancedAbi: "高级：合约 ABI（JSON）",
    placeholder:
      "粘贴已签名/未签名交易（hex 或 JSON）、calldata、EIP-712 typed data 或交易哈希…",
    emptyTitle: "粘贴任意链上输入",
    emptyDesc: "支持交易 hex/JSON、calldata、EIP-712、tx hash",
    parsing: "解析中…",
    themeLight: "浅色",
    themeDark: "深色",
    themeSystem: "跟随系统",
    tabSummary: "摘要",
    tabReview: "审查",
    tabTx: "交易",
    tabCalldata: "Calldata",
    signerAddress: "签名地址（可选）",
    signerPlaceholder: "0x… 用于核对 owner/delegator",
    tabOnchain: "链上",
    tabRaw: "原始",
    copyOk: "已复制",
    continueParse: "继续解析",
    selectHit: "选择匹配的链上交易",
  },
  en: {
    tagline: "Understand before you sign",
    parse: "Parse",
    clear: "Clear",
    chainOptional: "Chain (optional)",
    chainRequired: "Chain (required)",
    advancedAbi: "Advanced: contract ABI (JSON)",
    placeholder:
      "Paste signed/unsigned tx (hex or JSON), calldata, EIP-712, or tx hash…",
    emptyTitle: "Paste any on-chain input",
    emptyDesc: "Supports tx hex/JSON, calldata, EIP-712, tx hash",
    parsing: "Parsing…",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    tabSummary: "Summary",
    tabReview: "Review",
    tabTx: "Transaction",
    tabCalldata: "Calldata",
    signerAddress: "Signer address (optional)",
    signerPlaceholder: "0x… to verify owner/delegator",
    tabOnchain: "On-chain",
    tabRaw: "Raw",
    copyOk: "Copied",
    continueParse: "Continue",
    selectHit: "Select matching transaction",
  },
} as const;

export function t(locale: Locale, key: keyof (typeof messages)["zh"]): string {
  return messages[locale][key];
}
