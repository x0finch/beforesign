import type { AiPipelineDeps } from "@beforesign/ai-pipeline";
import type { ViewSpec } from "@beforesign/core";
import { parseAgentTurn } from "./agent_turn.ts";
import { resolveAssistantSpec } from "./assistant_spec.ts";
import { buildFactsContext, summarizeAssistantSpec } from "./context_builder.ts";
import { buildAgentSystemPrompt } from "./prompts/agent_system.ts";
import { buildSystemPrompt } from "./prompts/system.ts";
import { createMessageId } from "./session_state.ts";
import { runTool } from "./tools/tool_runner.ts";
import type {
  AskInput,
  AskSession,
  AskSseEvent,
  LlmMessage,
  LlmStream,
  TimelineEntry,
} from "./types.ts";

const MAX_ITERATIONS = 8;

export type RunAgentLoopOptions = {
  session: AskSession;
  input: AskInput;
  deps: AiPipelineDeps;
  llm?: LlmStream;
};

async function collectLlmText(llm: LlmStream, messages: LlmMessage[]): Promise<string> {
  let text = "";
  for await (const chunk of llm.streamChat(messages)) {
    text += chunk;
  }
  return text;
}

function buildInitialUserContext(input: AskInput, session: AskSession): string {
  const lines = [
    `User message: ${input.message}`,
    input.raw ? `Raw input present: yes` : `Raw input present: no`,
    session.parseResult
      ? `Session has parseResult: yes (kind=${session.parseResult.kind})`
      : `Session has parseResult: no`,
  ];
  return lines.join("\n");
}

async function requestAgentTurn(
  llm: LlmStream,
  turnMessages: LlmMessage[],
): Promise<{ turn: ReturnType<typeof parseAgentTurn>; raw: string }> {
  const raw = await collectLlmText(llm, turnMessages);
  return { turn: parseAgentTurn(raw), raw };
}

async function generateRespond(
  llm: LlmStream,
  session: AskSession,
  input: AskInput,
): Promise<ViewSpec> {
  const facts = buildFactsContext(session.parseResult);
  const system = buildSystemPrompt(input.locale);

  const history = session.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content:
        m.role === "assistant" && m.spec
          ? summarizeAssistantSpec(m.spec)
          : m.content,
    }));

  const userContent =
    input.locale === "zh"
      ? `用户问题：${input.message}\n\n解析事实：\n${facts}`
      : `User question: ${input.message}\n\nParsed facts:\n${facts}`;

  const assistantText = await collectLlmText(llm, [
    { role: "system", content: system },
    ...history.slice(0, -1),
    { role: "user", content: userContent },
  ]);

  return resolveAssistantSpec(assistantText, input.locale);
}

function* emitTimeline(entry: TimelineEntry): Generator<AskSseEvent> {
  yield { type: "timeline", entry };
}

async function* runFallbackPipeline(
  options: RunAgentLoopOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps } = options;
  const zh = input.locale === "zh";

  if (input.raw?.trim()) {
    yield* emitTimeline({
      kind: "thought",
      text: zh ? "未配置 LLM，先识别输入类型。" : "No LLM configured; detecting input type.",
    });
    yield* emitTimeline({ kind: "tool", name: "detect_input", status: "running" });
    const detect = await runTool("detect_input", session, input, deps);
    yield* emitTimeline({
      kind: "tool",
      name: "detect_input",
      status: detect.ok ? "done" : "error",
      summary: detect.summary,
    });
    if (!detect.ok) {
      const hint =
        zh
          ? "无法识别输入格式。"
          : "Unrecognized input.";
      const spec = resolveAssistantSpec(hint, input.locale);
      yield { type: "assistant_spec", spec };
      yield { type: "done", sessionId: session.id };
      return;
    }
  }

  yield* emitTimeline({
    kind: "thought",
    text: zh ? "构建审查视图。" : "Building review view.",
  });
  yield* emitTimeline({ kind: "tool", name: "build_view", status: "running" });
  const built = await runTool("build_view", session, input, deps);
  yield* emitTimeline({
    kind: "tool",
    name: "build_view",
    status: built.ok ? "done" : "error",
    summary: built.summary,
  });

  if (built.parseResult) yield { type: "parse_result", result: built.parseResult };
  if (built.discovery) {
    yield { type: "needs_input", discovery: built.discovery };
    const pick =
      zh
        ? "在多条链上找到了匹配交易，请选择正确的链。"
        : "Multiple chains matched. Select the correct chain.";
    const spec = resolveAssistantSpec(pick, input.locale);
    yield { type: "assistant_spec", spec };
    yield { type: "done", sessionId: session.id };
    return;
  }

  if (!built.ok) {
    yield { type: "error", message: built.observation };
    return;
  }

  const fallback = session.parseResult?.summary ?? input.message;
  const spec = resolveAssistantSpec(fallback, input.locale);
  yield { type: "assistant_spec", spec };
  yield { type: "done", sessionId: session.id };
}

export async function* runAgentLoop(
  options: RunAgentLoopOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps, llm } = options;

  if (!llm) {
    yield* runFallbackPipeline(options);
    return;
  }

  const system = buildAgentSystemPrompt(input.locale);
  const initialContext = buildInitialUserContext(input, session);
  const turnMessages: LlmMessage[] = [
    { role: "system", content: system },
    { role: "user", content: initialContext },
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const { turn, raw } = await requestAgentTurn(llm, turnMessages);

    if (!turn) {
      turnMessages.push({ role: "assistant", content: raw });
      turnMessages.push({
        role: "user",
        content:
          input.locale === "zh"
            ? "无法解析你的回复。请只输出 JSON：{ \"thought\": \"...\", \"tool\": \"...\" }"
            : 'Could not parse your reply. Output JSON only: { "thought": "...", "tool": "..." }',
      });
      continue;
    }

    turnMessages.push({ role: "assistant", content: raw });
    yield* emitTimeline({ kind: "thought", text: turn.thought });

    if (turn.tool === "respond") {
      yield { type: "status", phase: "thinking" };
      try {
        const spec = await generateRespond(llm, session, input);
        const assistantId = createMessageId();
        session.messages.push({
          id: assistantId,
          role: "assistant",
          content: "",
          spec,
          createdAt: Date.now(),
        });
        session.updatedAt = Date.now();
        yield { type: "assistant_spec", spec };
        yield { type: "done", sessionId: session.id };
      } catch (e) {
        const message = e instanceof Error ? e.message : "respond failed";
        yield { type: "error", message };
      }
      return;
    }

    yield* emitTimeline({ kind: "tool", name: turn.tool, status: "running" });
    const result = await runTool(turn.tool, session, input, deps);
    yield* emitTimeline({
      kind: "tool",
      name: turn.tool,
      status: result.ok ? "done" : "error",
      summary: result.summary ?? result.observation.slice(0, 120),
    });

    if (result.parseResult) {
      yield { type: "parse_result", result: result.parseResult };
    }

    if (result.discovery) {
      yield { type: "needs_input", discovery: result.discovery };
      const pick =
        input.locale === "zh"
          ? "在多条链上找到了匹配交易，请在下方选择正确的链后再继续。"
          : "Multiple chains matched. Select the correct chain below to continue.";
      const spec = resolveAssistantSpec(pick, input.locale);
      yield { type: "assistant_spec", spec };
      yield { type: "done", sessionId: session.id };
      return;
    }

    turnMessages.push({
      role: "user",
      content: `Tool ${turn.tool} result:\n${result.observation}`,
    });
  }

  yield {
    type: "error",
    message:
      input.locale === "zh"
        ? "Agent 步数超限，请重试或缩小问题范围。"
        : "Agent iteration limit reached.",
  };
}
