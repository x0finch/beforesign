export type locale = "zh" | "en";

const messages = {
  zh: {
    tagline: "签名之前，先看懂",
    parse: "解析",
    clear: "清空",
    chain_optional: "链（可选）",
    chain_required: "链（必选）",
    advanced_abi: "高级：合约 ABI（JSON）",
    placeholder:
      "粘贴已签名/未签名交易（hex 或 JSON）、calldata、EIP-712 typed data 或交易哈希…",
    empty_title: "粘贴任意链上输入",
    empty_desc: "支持交易 hex/JSON、calldata、EIP-712、tx hash",
    parsing: "解析中…",
    theme_light: "浅色",
    theme_dark: "深色",
    theme_system: "跟随系统",
    tab_summary: "摘要",
    tab_tx: "交易",
    tab_calldata: "Calldata",
    tab_typed: "Typed Data",
    tab_onchain: "链上",
    tab_raw: "原始",
    copy_ok: "已复制",
    continue_parse: "继续解析",
    select_hit: "选择匹配的链上交易",
  },
  en: {
    tagline: "Understand before you sign",
    parse: "Parse",
    clear: "Clear",
    chain_optional: "Chain (optional)",
    chain_required: "Chain (required)",
    advanced_abi: "Advanced: contract ABI (JSON)",
    placeholder:
      "Paste signed/unsigned tx (hex or JSON), calldata, EIP-712, or tx hash…",
    empty_title: "Paste any on-chain input",
    empty_desc: "Supports tx hex/JSON, calldata, EIP-712, tx hash",
    parsing: "Parsing…",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    tab_summary: "Summary",
    tab_tx: "Transaction",
    tab_calldata: "Calldata",
    tab_typed: "Typed Data",
    tab_onchain: "On-chain",
    tab_raw: "Raw",
    copy_ok: "Copied",
    continue_parse: "Continue",
    select_hit: "Select matching transaction",
  },
} as const;

export function t(locale: locale, key: keyof (typeof messages)["zh"]): string {
  return messages[locale][key];
}
