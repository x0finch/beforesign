export type Locale = "zh" | "en";

const messages = {
  zh: {
    tagline: "签名之前，先看懂",
    placeholder:
      "粘贴已签名/未签名交易（hex 或 JSON）、calldata、EIP-712 typed data 或交易哈希…",
    themeLight: "浅色",
    themeDark: "深色",
    themeSystem: "跟随系统",
    copyOk: "已复制",
    continueParse: "继续解析",
    selectHit: "选择匹配的链上交易",
    aiAsk: "Ask",
    aiNewChat: "新对话",
    aiFollowUp: "继续追问…",
    aiEmptyTitle: "粘贴链上输入，我来解读",
    aiEmptyDesc: "支持 tx hash、交易 hex/JSON、calldata、EIP-712",
    aiThinking: "正在分析…",
    aiDetecting: "识别类型…",
    aiBuilding: "构建审查视图…",
    aiLlmMissing: "未配置 LLM（LLM_API_KEY）。仍可解析，但无智能解读。",
    aiViewArtifact: "查看解析结果",
    aiExportContext: "导出上下文",
  },
  en: {
    tagline: "Understand before you sign",
    placeholder:
      "Paste signed/unsigned tx (hex or JSON), calldata, EIP-712, or tx hash…",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    copyOk: "Copied",
    continueParse: "Continue",
    selectHit: "Select matching transaction",
    aiAsk: "Ask",
    aiNewChat: "New chat",
    aiFollowUp: "Ask a follow-up…",
    aiEmptyTitle: "Paste on-chain input for analysis",
    aiEmptyDesc: "Tx hash, tx hex/JSON, calldata, EIP-712",
    aiThinking: "Analyzing…",
    aiDetecting: "Detecting type…",
    aiBuilding: "Building review…",
    aiLlmMissing: "LLM not configured (LLM_API_KEY). Parsing works without AI narration.",
    aiViewArtifact: "Parsed result",
    aiExportContext: "Export context",
  },
} as const;

export function t(locale: Locale, key: keyof (typeof messages)["zh"]): string {
  return messages[locale][key];
}
