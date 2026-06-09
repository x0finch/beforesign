import { assembleParseResult, type AiPipelineDeps } from "@beforesign/ai-pipeline";
import { detectInputType } from "@beforesign/detect";
import { buildStepEvent } from "./agent_steps.ts";
import { resolveAssistantSpec } from "./assistant_spec.ts";
import { buildFactsContext, summarizeAssistantSpec } from "./context_builder.ts";
import { buildSystemPrompt } from "./prompts/system.ts";
import {
  appendMessage,
  buildParseInputFromAsk,
  createMessageId,
} from "./session_state.ts";
import type {
  AskInput,
  AskSession,
  AskSseEvent,
  LlmStream,
} from "./types.ts";

export type RunAskSessionOptions = {
  session: AskSession;
  input: AskInput;
  deps: AiPipelineDeps;
  llm?: LlmStream;
};

function shouldRebuildParse(input: AskInput, session: AskSession): boolean {
  if (input.raw?.trim()) return true;
  if (input.selectedDiscoveryHit && session.lastParseInput) return true;
  if (input.chainId !== undefined && session.lastParseInput) return true;
  return false;
}

export async function* runAskSession(
  options: RunAskSessionOptions,
): AsyncGenerator<AskSseEvent> {
  const { session, input, deps, llm } = options;
  const { locale } = input;

  appendMessage(session, "user", input.message);

  yield buildStepEvent("think", locale, "running");

  const needsRebuild = shouldRebuildParse(input, session);

  if (needsRebuild && input.raw?.trim()) {
    yield buildStepEvent("think", locale, "done");
    yield { type: "status", phase: "detecting" };
    yield { type: "tool", name: "detect_input" };
    yield buildStepEvent("detect", locale, "running");

    const detected = detectInputType(input.raw);
    if (detected.kind === "unknown") {
      yield buildStepEvent("detect", locale, "error");
      const hint =
        locale === "zh"
          ? "无法识别输入格式。请粘贴 tx hash、交易 hex/JSON、calldata 或 EIP-712 JSON。"
          : "Unrecognized input. Paste a tx hash, transaction hex/JSON, calldata, or EIP-712 JSON.";
      yield buildStepEvent("explain", locale, "running");
      const hintSpec = resolveAssistantSpec(hint, locale);
      const hintMessage = appendMessage(session, "assistant", hint);
      hintMessage.spec = hintSpec;
      yield buildStepEvent("explain", locale, "done");
      yield { type: "assistant_spec", spec: hintSpec };
      yield { type: "done", sessionId: session.id };
      return;
    }

    yield buildStepEvent("detect", locale, "done", detected.kind);

    session.lastParseInput = buildParseInputFromAsk({
      raw: input.raw.trim(),
      chainId: input.chainId ?? session.lastParseInput?.chainId,
      abi: input.abi ?? session.lastParseInput?.abi,
      signerAddress: input.signerAddress ?? session.lastParseInput?.signerAddress,
      selectedDiscoveryHit:
        input.selectedDiscoveryHit ?? session.lastParseInput?.selectedDiscoveryHit,
      locale,
    });
  } else if (needsRebuild && session.lastParseInput) {
    yield buildStepEvent("think", locale, "done");
    session.lastParseInput = {
      ...session.lastParseInput,
      ...(input.selectedDiscoveryHit
        ? { selectedDiscoveryHit: input.selectedDiscoveryHit }
        : {}),
      ...(input.chainId !== undefined ? { chainId: input.chainId } : {}),
    };
  } else if (session.parseResult) {
    yield buildStepEvent("think", locale, "done");
    yield buildStepEvent("context", locale, "running");
    yield buildStepEvent("context", locale, "done");
  } else {
    yield buildStepEvent("think", locale, "done");
  }

  if (session.lastParseInput && (needsRebuild || !session.parseResult)) {
    yield { type: "status", phase: "building_view" };
    yield { type: "tool", name: "build_view" };
    yield buildStepEvent("parse", locale, "running");

    try {
      const result = await assembleParseResult(session.lastParseInput, deps);
      session.parseResult = result;
      const parseDetail = result.view?.title ?? result.summary;
      yield buildStepEvent("parse", locale, "done", parseDetail);
      yield { type: "parse_result", result };

      if (result.view?.discovery?.status === "ambiguous") {
        yield {
          type: "needs_input",
          discovery: result.view.discovery,
        };
        const pickChain =
          locale === "zh"
            ? "在多条链上找到了匹配交易，请在下方选择正确的链后再继续。"
            : "Multiple chains matched. Select the correct chain below to continue.";
        yield buildStepEvent("explain", locale, "running");
        const pickSpec = resolveAssistantSpec(pickChain, locale);
        const pickMessage = appendMessage(session, "assistant", pickChain);
        pickMessage.spec = pickSpec;
        yield buildStepEvent("explain", locale, "done");
        yield { type: "assistant_spec", spec: pickSpec };
        yield { type: "done", sessionId: session.id };
        return;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "build_view failed";
      yield buildStepEvent("parse", locale, "error", message);
      yield { type: "error", message };
      return;
    }
  }

  if (!llm) {
    yield buildStepEvent("explain", locale, "running");
    const fallback = session.parseResult?.summary ?? input.message;
    const fallbackSpec = resolveAssistantSpec(fallback, locale);
    const fallbackMessage = appendMessage(session, "assistant", fallback);
    fallbackMessage.spec = fallbackSpec;
    yield buildStepEvent("explain", locale, "done");
    yield { type: "assistant_spec", spec: fallbackSpec };
    yield { type: "done", sessionId: session.id };
    return;
  }

  yield { type: "status", phase: "thinking" };
  yield buildStepEvent("explain", locale, "running");

  const facts = buildFactsContext(session.parseResult);
  const system = buildSystemPrompt(locale);

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
    locale === "zh"
      ? `用户问题：${input.message}\n\n解析事实：\n${facts}`
      : `User question: ${input.message}\n\nParsed facts:\n${facts}`;

  let assistantText = "";
  const assistantId = createMessageId();

  try {
    for await (const chunk of llm.streamChat([
      { role: "system", content: system },
      ...history.slice(0, -1),
      { role: "user", content: userContent },
    ])) {
      assistantText += chunk;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "LLM failed";
    yield buildStepEvent("explain", locale, "error", message);
    yield { type: "error", message };
    return;
  }

  const assistantSpec = resolveAssistantSpec(assistantText, locale);

  session.messages.push({
    id: assistantId,
    role: "assistant",
    content: assistantText,
    spec: assistantSpec,
    createdAt: Date.now(),
  });
  session.updatedAt = Date.now();

  yield buildStepEvent("explain", locale, "done");
  yield { type: "assistant_spec", spec: assistantSpec };
  yield { type: "done", sessionId: session.id };
}
