import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import type { RunItemStreamEvent, RunStreamEvent } from "@openai/agents";
import { createBeforeSignAgent } from "./beforesign_agent.ts";
import {
  getAgentMemorySession,
  syncOpenAIConversationId,
} from "./beforesign_session.ts";
import { beforeSignSessionInputCallback } from "./session_input_callback.ts";
import {
  buildUserTurn,
  captureAgentContextExport,
} from "./export_agent_context.ts";
import { normalizeAskInput, type NormalizedAskInput } from "./normalize_ask_input.ts";
import { createRunner } from "./runner_config.ts";
import type { BeforeSignRunContext, LlmRuntimeConfig } from "./run_context.ts";
import type { AskInput, AskSession, AskSseEvent, TimelineEntry } from "./types.ts";

function llmNotConfiguredMessage(locale: AskInput["locale"]): string {
  return locale === "zh"
    ? "未配置 LLM。请设置 LLM_API_KEY 环境变量。"
    : "LLM is not configured. Set LLM_API_KEY.";
}

export type RunBeforeSignAskOptions = {
  session: AskSession;
  input: AskInput;
  deps: AiPipelineDeps;
  llm?: LlmRuntimeConfig;
};

async function* emitSessionEnd(
  session: AskSession,
  normalized: NormalizedAskInput,
  terminal: AskSseEvent,
): AsyncGenerator<AskSseEvent> {
  const snapshot = await captureAgentContextExport(session, normalized);
  yield { type: "context_export", export: snapshot };
  yield terminal;
}

function* emitTimeline(entry: TimelineEntry): Generator<AskSseEvent> {
  yield { type: "timeline", entry };
}

function extractAssistantMessageText(item: RunItemStreamEvent["item"]): string | undefined {
  if (item.type !== "message_output_item") return undefined;
  const raw = item.rawItem as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const parts = raw.content
    ?.filter((part) => part.type === "output_text" || part.type === "text")
    .map((part) => part.text)
    .filter(Boolean);
  return parts?.join("\n").trim() || undefined;
}

function extractReasoningText(item: RunItemStreamEvent["item"]): string | undefined {
  if (item.type !== "reasoning_item") return undefined;
  const raw = item.rawItem as { content?: Array<{ type?: string; text?: string }> };
  const parts = raw.content
    ?.filter((part) => part.type === "output_text" || part.type === "reasoning_text")
    .map((part) => part.text)
    .filter(Boolean);
  return parts?.join("\n").trim() || undefined;
}

function extractToolName(item: RunItemStreamEvent["item"]): string | undefined {
  if (item.type === "tool_call_item") {
    const raw = item.rawItem as { name?: string };
    return raw.name;
  }
  if (item.type === "tool_call_output_item") {
    const raw = item.rawItem as { name?: string };
    return raw.name;
  }
  return undefined;
}

function summarizeToolOutput(output: unknown): string {
  const raw =
    typeof output === "string"
      ? output
      : (() => {
          try {
            return JSON.stringify(output);
          } catch {
            return String(output);
          }
        })();

  try {
    const parsed = JSON.parse(raw) as { spec?: unknown };
    if (parsed.spec) return "spec";
  } catch {
    // not JSON tool payload
  }

  return raw.slice(0, 120);
}

export async function* runBeforeSignAsk(
  options: RunBeforeSignAskOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps, llm } = options;
  const normalized = normalizeAskInput(input);

  if (!llm?.apiKey) {
    yield { type: "error", message: llmNotConfiguredMessage(input.locale) };
    return;
  }

  const agent = createBeforeSignAgent(input.locale);
  const runner = createRunner(llm);
  const memorySession = getAgentMemorySession(session, llm);
  const pendingEvents: AskSseEvent[] = [];
  let stopAfterDiscovery = false;

  const runContext: BeforeSignRunContext = {
    session,
    deps,
    locale: input.locale,
    normalized,
    emit: (event) => {
      pendingEvents.push(event);
      if (event.type === "needs_input") stopAfterDiscovery = true;
    },
  };

  const userTurn = buildUserTurn(session, normalized);

  yield { type: "status", phase: "detecting" };

  const stream = await runner.run(agent, userTurn, {
    session: memorySession,
    sessionInputCallback: beforeSignSessionInputCallback,
    context: runContext,
    stream: true,
    maxTurns: 10,
  });

  let assistantTextEmitted = false;

  for await (const event of stream as AsyncIterable<RunStreamEvent>) {
    while (pendingEvents.length > 0) {
      yield pendingEvents.shift()!;
    }

    if (event.type !== "run_item_stream_event") continue;

    const itemEvent = event as RunItemStreamEvent;

    if (itemEvent.name === "reasoning_item_created") {
      const text = extractReasoningText(itemEvent.item);
      if (text) {
        yield* emitTimeline({ kind: "thought", text });
      }
      continue;
    }

    if (itemEvent.name === "tool_called") {
      const name = extractToolName(itemEvent.item) ?? "tool";
      yield* emitTimeline({ kind: "tool", name, status: "running" });
      continue;
    }

    if (itemEvent.name === "tool_output") {
      const name = extractToolName(itemEvent.item) ?? "tool";
      const output =
        itemEvent.item.type === "tool_call_output_item"
          ? itemEvent.item.output
          : undefined;
      yield* emitTimeline({
        kind: "tool",
        name,
        status: "done",
        summary: summarizeToolOutput(output),
      });
      continue;
    }

    if (itemEvent.name === "message_output_created") {
      const text = extractAssistantMessageText(itemEvent.item);
      if (text) {
        assistantTextEmitted = true;
        yield { type: "assistant_text", content: text };
      }
    }
  }

  await stream.completed;

  if (!assistantTextEmitted) {
    const finalText =
      typeof stream.finalOutput === "string" ? stream.finalOutput.trim() : "";
    if (finalText) {
      yield { type: "assistant_text", content: finalText };
    }
  }
  await syncOpenAIConversationId(session, memorySession);

  while (pendingEvents.length > 0) {
    yield pendingEvents.shift()!;
  }

  if (stopAfterDiscovery) {
    yield* emitSessionEnd(session, normalized, {
      type: "done",
      sessionId: session.id,
    });
    return;
  }

  yield* emitSessionEnd(session, normalized, {
    type: "done",
    sessionId: session.id,
  });
}
