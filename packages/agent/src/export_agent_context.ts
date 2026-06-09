import type { AgentInputItem } from "@openai/agents";
import { buildFactsContext, summarizeAssistantSpec } from "./context_builder.ts";
import { getAgentMemorySession } from "./beforesign_session.ts";
import { buildBeforeSignInstructions } from "./prompts/beforesign_instructions.ts";
import { beforeSignTools } from "./sdk_tools.ts";
import type { NormalizedAskInput } from "./normalize_ask_input.ts";
import type { AskLocale, AskSession } from "./types.ts";

export type AgentContextExport = {
  exportedAt: string;
  sessionId: string;
  locale: AskLocale;
  agent: {
    name: string;
    instructions: string;
    tools: Array<{ name: string; description: string }>;
  };
  turn: {
    message: string;
    raw?: string;
    normalized: {
      detectedKind: NormalizedAskInput["detectedKind"];
      parseTargetSource: NormalizedAskInput["parseTargetSource"];
      chainId?: number;
      selectedDiscoveryHit?: string;
    };
    preamble: string;
    userTurn: string;
  };
  session: {
    chatMessages: Array<{
      role: string;
      content: string;
      createdAt: number;
    }>;
    parseFacts: string;
    parseResult?: {
      kind: string;
      summary: string;
      title?: string;
    };
    lastParseInput?: AskSession["lastParseInput"];
  };
  agentMemoryItems: AgentInputItem[];
};

export function buildTurnPreamble(
  session: AskSession,
  normalized: NormalizedAskInput,
): string {
  const lines = [
    `User message: ${normalized.message}`,
    normalized.raw
      ? `Parse target: ${normalized.raw} (kind=${normalized.detectedKind}, source=${normalized.parseTargetSource})`
      : "Parse target: none in this message",
    session.parseResult
      ? `Session parseResult: kind=${session.parseResult.kind}, title=${session.parseResult.view?.title ?? session.parseResult.summary}`
      : "Session parseResult: none",
  ];
  return lines.join("\n");
}

export function buildUserTurn(
  session: AskSession,
  normalized: NormalizedAskInput,
): string {
  return `${buildTurnPreamble(session, normalized)}\n\n${normalized.message}`;
}

function serializeMemoryItems(items: AgentInputItem[]): AgentInputItem[] {
  try {
    return structuredClone(items);
  } catch {
    return JSON.parse(JSON.stringify(items)) as AgentInputItem[];
  }
}

export async function buildAgentContextExport(
  session: AskSession,
  normalized: NormalizedAskInput,
): Promise<AgentContextExport> {
  const memorySession = session.agentMemory ?? getAgentMemorySession(session);
  const memoryItems = await memorySession.getItems();
  const preamble = buildTurnPreamble(session, normalized);
  const parseFacts = buildFactsContext(session.parseResult);

  return {
    exportedAt: new Date().toISOString(),
    sessionId: session.id,
    locale: normalized.locale,
    agent: {
      name: "BeforeSign",
      instructions: buildBeforeSignInstructions(normalized.locale),
      tools: beforeSignTools.map((toolDef) => ({
        name: toolDef.name,
        description: toolDef.description,
      })),
    },
    turn: {
      message: normalized.message,
      ...(normalized.raw ? { raw: normalized.raw } : {}),
      normalized: {
        detectedKind: normalized.detectedKind,
        parseTargetSource: normalized.parseTargetSource,
        ...(normalized.chainId !== undefined ? { chainId: normalized.chainId } : {}),
        ...(normalized.selectedDiscoveryHit
          ? { selectedDiscoveryHit: normalized.selectedDiscoveryHit }
          : {}),
      },
      preamble,
      userTurn: buildUserTurn(session, normalized),
    },
    session: {
      chatMessages: session.messages.map((m) => ({
        role: m.role,
        content:
          m.role === "assistant" && m.spec
            ? summarizeAssistantSpec(m.spec)
            : m.content,
        createdAt: m.createdAt,
      })),
      parseFacts,
      ...(session.parseResult
        ? {
            parseResult: {
              kind: session.parseResult.kind,
              summary: session.parseResult.summary,
              title: session.parseResult.view?.title,
            },
          }
        : {}),
      ...(session.lastParseInput ? { lastParseInput: session.lastParseInput } : {}),
    },
    agentMemoryItems: serializeMemoryItems(memoryItems),
  };
}

export async function captureAgentContextExport(
  session: AskSession,
  normalized: NormalizedAskInput,
): Promise<AgentContextExport> {
  const snapshot = await buildAgentContextExport(session, normalized);
  session.lastContextExport = snapshot;
  session.updatedAt = Date.now();
  return snapshot;
}
