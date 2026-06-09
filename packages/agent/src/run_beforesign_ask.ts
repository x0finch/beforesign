import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import type { RunItemStreamEvent, RunStreamEvent } from "@openai/agents";
import { createBeforeSignAgent } from "./beforesign_agent.ts";
import { getAgentMemorySession } from "./beforesign_session.ts";
import {
  buildUserTurn,
  captureAgentContextExport,
} from "./export_agent_context.ts";
import { generateRespond } from "./generate_respond.ts";
import { normalizeAskInput, type NormalizedAskInput } from "./normalize_ask_input.ts";
import { createRunner } from "./runner_config.ts";
import type { BeforeSignRunContext, LlmRuntimeConfig } from "./run_context.ts";
import { resolveAssistantSpec } from "./assistant_spec.ts";
import { createMessageId } from "./session_state.ts";
import {
  runBuildViewAction,
  runDetectInputAction,
} from "./tool_actions.ts";
import type { AskInput, AskSession, AskSseEvent, TimelineEntry } from "./types.ts";

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
  if (typeof output === "string") return output.slice(0, 120);
  try {
    return JSON.stringify(output).slice(0, 120);
  } catch {
    return String(output).slice(0, 120);
  }
}

async function* runFallbackPipeline(
  options: RunBeforeSignAskOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps } = options;
  const normalized = normalizeAskInput(input);
  const zh = input.locale === "zh";
  const events: AskSseEvent[] = [];
  const emit = (event: AskSseEvent) => {
    events.push(event);
  };

  if (normalized.raw?.trim()) {
    yield* emitTimeline({
      kind: "thought",
      text: zh ? "未配置 LLM，先识别输入类型。" : "No LLM configured; detecting input type.",
    });
    yield* emitTimeline({ kind: "tool", name: "detect_input", status: "running" });
    const detect = runDetectInputAction(session, normalized);
    yield* emitTimeline({
      kind: "tool",
      name: "detect_input",
      status: detect.ok ? "done" : "error",
      summary: detect.summary,
    });
    if (!detect.ok) {
      const spec = resolveAssistantSpec(
        zh ? "无法识别输入格式。" : "Unrecognized input.",
        input.locale,
      );
      yield { type: "assistant_spec", spec };
      yield* emitSessionEnd(session, normalized, {
        type: "done",
        sessionId: session.id,
      });
      return;
    }
  }

  yield* emitTimeline({
    kind: "thought",
    text: zh ? "构建审查视图。" : "Building review view.",
  });
  yield* emitTimeline({ kind: "tool", name: "build_view", status: "running" });
  const built = await runBuildViewAction(session, normalized, deps, emit);
  yield* emitTimeline({
    kind: "tool",
    name: "build_view",
    status: built.ok ? "done" : "error",
    summary: built.summary,
  });

  for (const event of events) {
    if (event.type === "parse_result" || event.type === "needs_input") {
      yield event;
    }
  }

  if (built.discovery) {
    const pick =
      zh
        ? "在多条链上找到了匹配交易，请选择正确的链。"
        : "Multiple chains matched. Select the correct chain.";
    yield { type: "assistant_spec", spec: resolveAssistantSpec(pick, input.locale) };
    yield* emitSessionEnd(session, normalized, {
      type: "done",
      sessionId: session.id,
    });
    return;
  }

  if (!built.ok) {
    yield* emitSessionEnd(session, normalized, {
      type: "error",
      message: built.message,
    });
    return;
  }

  const fallback = session.parseResult?.summary ?? input.message;
  yield { type: "assistant_spec", spec: resolveAssistantSpec(fallback, input.locale) };
  yield* emitSessionEnd(session, normalized, {
    type: "done",
    sessionId: session.id,
  });
}

export async function* runBeforeSignAsk(
  options: RunBeforeSignAskOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps, llm } = options;
  const normalized = normalizeAskInput(input);

  if (!llm) {
    yield* runFallbackPipeline({ session, input, deps, llm });
    return;
  }

  const agent = createBeforeSignAgent(input.locale);
  const runner = createRunner(llm);
  const memorySession = getAgentMemorySession(session);
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
    context: runContext,
    stream: true,
    maxTurns: 10,
  });

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
    }
  }

  await stream.completed;

  while (pendingEvents.length > 0) {
    yield pendingEvents.shift()!;
  }

  if (stopAfterDiscovery) {
    const pick =
      input.locale === "zh"
        ? "在多条链上找到了匹配交易，请在下方选择正确的链后再继续。"
        : "Multiple chains matched. Select the correct chain below to continue.";
    yield { type: "assistant_spec", spec: resolveAssistantSpec(pick, input.locale) };
    yield* emitSessionEnd(session, normalized, {
      type: "done",
      sessionId: session.id,
    });
    return;
  }

  yield { type: "status", phase: "thinking" };

  try {
    const spec = await generateRespond(llm, session, input);
    session.messages.push({
      id: createMessageId(),
      role: "assistant",
      content: "",
      spec,
      createdAt: Date.now(),
    });
    session.updatedAt = Date.now();
    yield { type: "assistant_spec", spec };
    yield* emitSessionEnd(session, normalized, {
      type: "done",
      sessionId: session.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "respond failed";
    yield* emitSessionEnd(session, normalized, { type: "error", message });
  }
}
