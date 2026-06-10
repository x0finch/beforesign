import type { AgentInputItem } from "@openai/agents";
import type { NormalizedAskInput } from "./normalize_ask_input.ts";
import { loadConversationEntries } from "./load_conversation.ts";
import { buildBeforeSignInstructions } from "./prompts/beforesign_instructions.ts";
import type { AskLocale, AskSession } from "./types.ts";
import type { LlmRuntimeConfig } from "./run_context.ts";

export type ConversationEntry =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | {
      role: "tool";
      name: string;
      arguments?: string;
      output?: string;
      status?: string;
    };

export type AgentContextExport = {
  exportedAt: string;
  conversationId: string;
  locale: AskLocale;
  conversation: ConversationEntry[];
};

type ToolConversationEntry = Extract<ConversationEntry, { role: "tool" }>;

export function buildUserTurn(
  _session: AskSession,
  normalized: NormalizedAskInput,
): string {
  const message = normalized.message.trim();
  const raw = normalized.raw?.trim();

  if (raw && message === raw) return raw;
  return message;
}

function truncateLongHex(value: string): string {
  if (!value.startsWith("0x") || value.length <= 200) return value;
  const byteLen = (value.length - 2) / 2;
  return `${value.slice(0, 66)}…${value.slice(-8)} (${byteLen} bytes)`;
}

function extractToolOutput(output: unknown): string {
  if (typeof output === "string") return truncateLongHex(output);
  if (output && typeof output === "object" && "text" in output) {
    const text = (output as { text?: unknown }).text;
    if (typeof text === "string") return truncateLongHex(text);
  }
  try {
    return truncateLongHex(JSON.stringify(output));
  } catch {
    return String(output);
  }
}

function extractToolArguments(argumentsValue: unknown): string {
  if (typeof argumentsValue === "string") return argumentsValue;
  try {
    return JSON.stringify(argumentsValue ?? {});
  } catch {
    return String(argumentsValue ?? "{}");
  }
}

function extractAssistantContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const typed = part as { type?: string; text?: string };
      if (typed.type === "output_text" || typed.type === "text") {
        return typed.text ?? "";
      }
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function flattenMemoryItems(items: AgentInputItem[]): ConversationEntry[] {
  const conversation: ConversationEntry[] = [];
  const toolsByCallId = new Map<string, ToolConversationEntry>();

  for (const item of items) {
    const typed = item as Record<string, unknown>;

    if (typed.type === "function_call") {
      const callId = String(typed.callId ?? "");
      const toolEntry: ToolConversationEntry = {
        role: "tool",
        name: String(typed.name ?? "tool"),
        arguments: extractToolArguments(typed.arguments),
      };
      if (callId) {
        toolsByCallId.set(callId, toolEntry);
      }
      conversation.push(toolEntry);
      continue;
    }

    if (typed.type === "function_call_result") {
      const callId = String(typed.callId ?? "");
      const output = extractToolOutput(typed.output);
      const status = typed.status ? String(typed.status) : undefined;
      const existing = callId ? toolsByCallId.get(callId) : undefined;

      if (existing) {
        existing.output = output;
        if (status) existing.status = status;
      } else {
        conversation.push({
          role: "tool",
          name: String(typed.name ?? "tool"),
          ...(status ? { status } : {}),
          output,
        });
      }
      continue;
    }

    if (typed.type !== "message") continue;

    if (typed.role === "user" && typeof typed.content === "string") {
      conversation.push({
        role: "user",
        content: truncateLongHex(typed.content),
      });
      continue;
    }

    if (typed.role === "assistant") {
      const content = extractAssistantContent(typed.content);
      if (content) {
        conversation.push({ role: "assistant", content });
      }
    }
  }

  return conversation;
}

export async function buildAgentContextExport(
  session: AskSession,
  locale: AskLocale,
  llm: LlmRuntimeConfig,
): Promise<AgentContextExport> {
  const memoryItems = await loadConversationEntries(session, llm);

  return {
    exportedAt: new Date().toISOString(),
    conversationId: session.id,
    locale,
    conversation: [
      {
        role: "system",
        content: buildBeforeSignInstructions(locale),
      },
      ...flattenMemoryItems(memoryItems),
    ],
  };
}

export async function captureAgentContextExport(
  session: AskSession,
  locale: AskLocale,
  llm: LlmRuntimeConfig,
): Promise<AgentContextExport> {
  return buildAgentContextExport(session, locale, llm);
}
