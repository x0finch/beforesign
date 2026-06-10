import { assembleParseResult } from "@beforesign/ai-pipeline";
import type { ParseInput, ParseResult } from "@beforesign/core";
import { detectInputType } from "@beforesign/detect";
import type { NormalizedAskInput } from "./normalize_ask_input.ts";
import type { BeforeSignRunContext } from "./run_context.ts";
import { buildParseInputFromAsk } from "./session_state.ts";
import type { AskSseEvent } from "./types.ts";
import { extractCalldataSource } from "./tools/extract_calldata.ts";

function specToolMessage(result: ParseResult): string {
  const spec = result.view?.spec;
  if (!spec) return JSON.stringify({ error: "missing spec" });
  return JSON.stringify({ spec });
}

function titleFromResult(result: ParseResult): string {
  return result.view?.title ?? result.summary;
}

export type ToolActionResult = {
  ok: boolean;
  message: string;
  summary?: string;
  discovery?: NonNullable<NonNullable<ParseResult["view"]>["discovery"]>;
};

function buildParseInputFromNormalized(normalized: NormalizedAskInput): ParseInput | undefined {
  const raw = normalized.raw?.trim();
  if (!raw) return undefined;
  return buildParseInputFromAsk({
    raw,
    chainId: normalized.chainId,
    abi: normalized.abi,
    signerAddress: normalized.signerAddress,
    selectedDiscoveryHit: normalized.selectedDiscoveryHit,
    locale: normalized.locale,
  });
}

function askInputFromNormalized(normalized: NormalizedAskInput) {
  return {
    message: normalized.message,
    raw: normalized.raw,
    chainId: normalized.chainId,
    abi: normalized.abi,
    signerAddress: normalized.signerAddress,
    selectedDiscoveryHit: normalized.selectedDiscoveryHit,
    locale: normalized.locale,
  };
}

export function runDetectInputAction(
  runContext: BeforeSignRunContext,
): ToolActionResult {
  const { normalized } = runContext;
  const raw = normalized.raw?.trim();
  if (!raw) {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "没有可检测的 parse target。请用户提供 tx hash、calldata 或交易 JSON。"
          : "No parse target to detect. Ask the user for a tx hash, calldata, or transaction JSON.",
    };
  }

  if (normalized.detectedKind !== "unknown") {
    return {
      ok: true,
      message: JSON.stringify({
        kind: normalized.detectedKind,
        preclassified: true,
        source: normalized.parseTargetSource,
      }),
      summary: normalized.detectedKind,
    };
  }

  const detected = detectInputType(raw);
  if (detected.kind === "unknown") {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "无法识别输入格式。请确认 hash/calldata/JSON 是否完整。"
          : "Input kind is unknown. Verify the hash/calldata/JSON is complete.",
      summary: "unknown",
    };
  }

  return {
    ok: true,
    message: JSON.stringify({ kind: detected.kind }),
    summary: detected.kind,
  };
}

export async function runBuildViewAction(
  runContext: BeforeSignRunContext,
): Promise<ToolActionResult> {
  const { normalized, deps, emit } = runContext;
  const parseInput = buildParseInputFromNormalized(normalized);

  if (!parseInput) {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "缺少 parse 输入。可先 detect_input，或请用户提供 hash/calldata。"
          : "Missing parse input. Run detect_input or ask the user for hash/calldata.",
    };
  }

  try {
    const result = await assembleParseResult(parseInput, deps);
    runContext.latestParseResult = result;
    emit({ type: "parse_result", result });

    const title = result.view?.title ?? result.summary;

    if (result.view?.discovery?.status === "ambiguous") {
      emit({ type: "needs_input", discovery: result.view.discovery });
      return {
        ok: true,
        message: JSON.stringify({ error: "ambiguous" }),
        summary: title,
        discovery: result.view.discovery,
      };
    }

    return {
      ok: true,
      message: specToolMessage(result),
      summary: titleFromResult(result),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "build_view failed";
    return { ok: false, message, summary: message };
  }
}

export async function runParseCalldataAction(
  runContext: BeforeSignRunContext,
): Promise<ToolActionResult> {
  const { normalized, deps, emit, latestParseResult } = runContext;

  if (!latestParseResult) {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "尚无 build_view 结果。请先 build_view 解析交易。"
          : "No build_view result yet. Run build_view on a transaction first.",
    };
  }

  const { calldata, contractAddress, chainId } = extractCalldataSource(latestParseResult);

  if (!calldata) {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "当前视图没有可解码的 Data/calldata。若用户粘贴了新 hex，请 build_view 新输入。"
          : "No decodable Data on the current view. If the user pasted new hex, use build_view.",
    };
  }

  const parseInput = buildParseInputFromAsk({
    raw: calldata,
    chainId: chainId ?? normalized.chainId,
    abi: normalized.abi,
    signerAddress: contractAddress ?? normalized.signerAddress,
    locale: normalized.locale,
  });

  try {
    const result = await assembleParseResult(parseInput, deps);
    runContext.latestParseResult = result;
    emit({ type: "parse_result", result });
    const title = result.view?.title ?? result.summary;

    return {
      ok: true,
      message: specToolMessage(result),
      summary: titleFromResult(result),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "parse_calldata failed";
    return { ok: false, message, summary: message };
  }
}

export { askInputFromNormalized };
