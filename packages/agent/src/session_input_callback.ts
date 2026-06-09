import type { AgentInputItem } from "@openai/agents";

const PARSE_TOOL_NAMES = new Set(["build_view", "parse_calldata"]);

function isParseToolResult(item: AgentInputItem): boolean {
  const typed = item as Record<string, unknown>;
  if (typed.type !== "function_call_result") return false;
  const name = typed.name;
  return typeof name === "string" && PARSE_TOOL_NAMES.has(name);
}

function parseToolOutput(output: unknown): Record<string, unknown> | undefined {
  let text: string | undefined;
  if (typeof output === "string") {
    text = output;
  } else if (output && typeof output === "object" && "text" in output) {
    const candidate = (output as { text?: unknown }).text;
    if (typeof candidate === "string") text = candidate;
  }
  if (!text) return undefined;
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function hasSpecInOutput(item: AgentInputItem): boolean {
  const typed = item as Record<string, unknown>;
  const payload = parseToolOutput(typed.output);
  return payload?.spec !== undefined;
}

function stripSpecFromParseToolItem(item: AgentInputItem): AgentInputItem {
  const typed = item as Record<string, unknown>;
  const payload = parseToolOutput(typed.output);
  if (!payload?.spec) return item;

  const nextPayload = { ...payload };
  delete nextPayload.spec;
  const nextText = JSON.stringify(
    Object.keys(nextPayload).length > 0 ? nextPayload : {},
  );

  if (typeof typed.output === "string") {
    return { ...item, output: nextText } as AgentInputItem;
  }

  if (typed.output && typeof typed.output === "object" && "text" in typed.output) {
    return {
      ...item,
      output: { ...(typed.output as object), text: nextText },
    } as AgentInputItem;
  }

  return { ...item, output: nextText } as AgentInputItem;
}

function findLastParseToolSpecIndex(items: AgentInputItem[]): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (isParseToolResult(items[i]!) && hasSpecInOutput(items[i]!)) {
      return i;
    }
  }
  return -1;
}

export function trimParseToolSpecsForModel(
  history: AgentInputItem[],
  newItems: AgentInputItem[],
): AgentInputItem[] {
  const combined = [...history, ...newItems];
  const keepSpecIndex = findLastParseToolSpecIndex(combined);

  const trimAt = (items: AgentInputItem[], offset: number) =>
    items.map((item, index) => {
      const globalIndex = offset + index;
      if (globalIndex === keepSpecIndex || !isParseToolResult(item)) {
        return item;
      }
      return stripSpecFromParseToolItem(item);
    });

  return [...trimAt(history, 0), ...trimAt(newItems, history.length)];
}

export const beforeSignSessionInputCallback = trimParseToolSpecsForModel;
