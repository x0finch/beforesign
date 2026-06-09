import type { AskInput, AskSession } from "../types.ts";

export type AgentToolName = "detect_input" | "build_view" | "get_facts" | "respond";

export type AgentToolDefinition = {
  name: AgentToolName;
  description: string;
  canRun: (session: AskSession, input: AskInput) => boolean;
  blockedReason: (session: AskSession, input: AskInput) => string;
};

export const agentTools: AgentToolDefinition[] = [
  {
    name: "detect_input",
    description:
      "Detect the InputKind of the user's raw paste (tx hash, calldata, typed data, signed/unsigned tx). Use when format is unclear or you want to confirm before building a view.",
    canRun: (_session, input) => Boolean(input.raw?.trim()),
    blockedReason: (_session, input) =>
      input.locale === "zh"
        ? "detect_input 需要 raw 输入，当前没有可检测内容。"
        : "detect_input requires raw input; none provided.",
  },
  {
    name: "build_view",
    description:
      "Build the structured review view (ParseResult + json-render spec) from raw input. Fetches on-chain data for tx hashes and assembles warnings.",
    canRun: (session, input) =>
      Boolean(input.raw?.trim() || session.lastParseInput?.raw),
    blockedReason: (session, input) =>
      input.locale === "zh"
        ? "build_view 需要 raw 或已有 lastParseInput。"
        : "build_view requires raw input or an existing lastParseInput.",
  },
  {
    name: "get_facts",
    description:
      "Read parsed facts from the current session (summary, reviewFields, warnings). Use on follow-ups when parse result already exists.",
    canRun: (session) => Boolean(session.parseResult),
    blockedReason: (_session, input) =>
      input.locale === "zh"
        ? "get_facts 需要已有 parseResult，请先 build_view。"
        : "get_facts requires parseResult; run build_view first.",
  },
  {
    name: "respond",
    description:
      "Produce the final user-facing json-render explanation card. Use only when you have enough facts to answer the user's question.",
    canRun: (session) => Boolean(session.parseResult),
    blockedReason: (_session, input) =>
      input.locale === "zh"
        ? "respond 需要 parseResult；事实不足时请继续调用工具。"
        : "respond requires parseResult; gather more facts with other tools first.",
  },
];

export function getToolDefinition(name: AgentToolName): AgentToolDefinition | undefined {
  return agentTools.find((tool) => tool.name === name);
}

export function formatToolCatalogForPrompt(): string {
  return agentTools
    .map((tool) => `- ${tool.name}: ${tool.description}`)
    .join("\n");
}

export function isAgentToolName(value: string): value is AgentToolName {
  return agentTools.some((tool) => tool.name === value);
}
