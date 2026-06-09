import { isAgentToolName, type AgentToolName } from "./tools/registry.ts";

export type AgentTurn = {
  thought: string;
  tool: AgentToolName;
};

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      // continue
    }
  }

  return null;
}

export function parseAgentTurn(raw: string): AgentTurn | null {
  const json = extractJsonObject(raw);
  if (!json || typeof json !== "object") return null;

  const candidate = json as { thought?: unknown; tool?: unknown };
  if (typeof candidate.thought !== "string" || typeof candidate.tool !== "string") {
    return null;
  }

  const thought = candidate.thought.trim();
  if (!thought || !isAgentToolName(candidate.tool)) return null;

  return {
    thought,
    tool: candidate.tool,
  };
}
