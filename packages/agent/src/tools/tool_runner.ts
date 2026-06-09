import { assembleParseResult, type AiPipelineDeps } from "@beforesign/ai-pipeline";
import { detectInputType } from "@beforesign/detect";
import { buildFactsContext, getParseFacts } from "../context_builder.ts";
import { buildParseInputFromAsk } from "../session_state.ts";
import type { AskInput, AskSession } from "../types.ts";
import {
  getToolDefinition,
  isAgentToolName,
  type AgentToolName,
} from "./registry.ts";

export type ToolRunResult = {
  ok: boolean;
  observation: string;
  summary?: string;
  parseResult?: AskSession["parseResult"];
  discovery?: NonNullable<
    NonNullable<AskSession["parseResult"]>["view"]
  >["discovery"];
};

function shouldRebuildParse(input: AskInput, session: AskSession): boolean {
  if (input.raw?.trim()) return true;
  if (input.selectedDiscoveryHit && session.lastParseInput) return true;
  if (input.chainId !== undefined && session.lastParseInput) return true;
  return false;
}

function ensureParseInput(session: AskSession, input: AskInput): void {
  if (session.lastParseInput) {
    if (input.selectedDiscoveryHit || input.chainId !== undefined) {
      session.lastParseInput = {
        ...session.lastParseInput,
        ...(input.selectedDiscoveryHit
          ? { selectedDiscoveryHit: input.selectedDiscoveryHit }
          : {}),
        ...(input.chainId !== undefined ? { chainId: input.chainId } : {}),
      };
    }
    return;
  }

  const raw = input.raw?.trim();
  if (!raw) return;

  session.lastParseInput = buildParseInputFromAsk({
    raw,
    chainId: input.chainId,
    abi: input.abi,
    signerAddress: input.signerAddress,
    selectedDiscoveryHit: input.selectedDiscoveryHit,
    locale: input.locale,
  });
}

async function runDetectInput(
  session: AskSession,
  input: AskInput,
): Promise<ToolRunResult> {
  const raw = input.raw?.trim();
  if (!raw) {
    return {
      ok: false,
      observation: "No raw input to detect.",
    };
  }

  const detected = detectInputType(raw);
  if (detected.kind === "unknown") {
    return {
      ok: false,
      observation:
        input.locale === "zh"
          ? "无法识别输入格式（unknown）。"
          : "Input kind is unknown.",
      summary: "unknown",
    };
  }

  session.lastParseInput = buildParseInputFromAsk({
    raw,
    chainId: input.chainId ?? session.lastParseInput?.chainId,
    abi: input.abi ?? session.lastParseInput?.abi,
    signerAddress: input.signerAddress ?? session.lastParseInput?.signerAddress,
    selectedDiscoveryHit:
      input.selectedDiscoveryHit ?? session.lastParseInput?.selectedDiscoveryHit,
    locale: input.locale,
  });

  return {
    ok: true,
    observation: JSON.stringify({ kind: detected.kind }),
    summary: detected.kind,
  };
}

async function runBuildView(
  session: AskSession,
  input: AskInput,
  deps: AiPipelineDeps,
): Promise<ToolRunResult> {
  ensureParseInput(session, input);

  if (!session.lastParseInput) {
    return {
      ok: false,
      observation:
        input.locale === "zh"
          ? "缺少 parse 输入，无法 build_view。"
          : "Missing parse input for build_view.",
    };
  }

  const needsRebuild = shouldRebuildParse(input, session);
  if (!needsRebuild && session.parseResult) {
    const title = session.parseResult.view?.title ?? session.parseResult.summary;
    return {
      ok: true,
      observation: JSON.stringify({
        kind: session.parseResult.kind,
        summary: session.parseResult.summary,
        cached: true,
      }),
      summary: title,
      parseResult: session.parseResult,
    };
  }

  try {
    const result = await assembleParseResult(session.lastParseInput, deps);
    session.parseResult = result;
    const title = result.view?.title ?? result.summary;

    if (result.view?.discovery?.status === "ambiguous") {
      return {
        ok: true,
        observation: JSON.stringify({
          kind: result.kind,
          summary: result.summary,
          discovery: "ambiguous",
        }),
        summary: title,
        parseResult: result,
        discovery: result.view.discovery,
      };
    }

    return {
      ok: true,
      observation: JSON.stringify({
        kind: result.kind,
        summary: result.summary,
        title,
      }),
      summary: title,
      parseResult: result,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "build_view failed";
    return {
      ok: false,
      observation: message,
      summary: message,
    };
  }
}

function runGetFacts(session: AskSession, input: AskInput): ToolRunResult {
  if (!session.parseResult) {
    return {
      ok: false,
      observation:
        input.locale === "zh" ? "尚无 parseResult。" : "No parseResult available.",
    };
  }

  const facts = getParseFacts(session.parseResult) || buildFactsContext(session.parseResult);
  return {
    ok: true,
    observation: facts,
    summary: session.parseResult.summary,
  };
}

export async function runTool(
  name: string,
  session: AskSession,
  input: AskInput,
  deps: AiPipelineDeps,
): Promise<ToolRunResult> {
  if (!isAgentToolName(name)) {
    return {
      ok: false,
      observation: `Unknown tool: ${name}`,
    };
  }

  const tool = getToolDefinition(name);
  if (!tool) {
    return { ok: false, observation: `Unknown tool: ${name}` };
  }

  if (!tool.canRun(session, input)) {
    return {
      ok: false,
      observation: tool.blockedReason(session, input),
    };
  }

  if (name === "detect_input") return runDetectInput(session, input);
  if (name === "build_view") return runBuildView(session, input, deps);
  if (name === "get_facts") return runGetFacts(session, input);

  return {
    ok: false,
    observation: "respond is handled by the agent loop, not tool_runner.",
  };
}

export type { AgentToolName };
