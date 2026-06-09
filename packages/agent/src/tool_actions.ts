import { assembleParseResult, type AiPipelineDeps } from "@beforesign/ai-pipeline";
import { detectInputType } from "@beforesign/detect";
import type { NormalizedAskInput } from "./normalize_ask_input.ts";
import { buildParseInputFromAsk } from "./session_state.ts";
import type { AskSession, AskSseEvent } from "./types.ts";
import {
  canDrillIntoCalldata,
  extractCalldataSource,
} from "./tools/extract_calldata.ts";

export type ToolActionResult = {
  ok: boolean;
  message: string;
  summary?: string;
  discovery?: NonNullable<
    NonNullable<AskSession["parseResult"]>["view"]
  >["discovery"];
};

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

function shouldRebuildParse(normalized: NormalizedAskInput, session: AskSession): boolean {
  const raw = normalized.raw?.trim();
  if (raw) {
    const previous = session.lastParseInput?.raw?.trim();
    if (!previous || raw !== previous) return true;
  }
  if (normalized.selectedDiscoveryHit && session.lastParseInput) return true;
  if (normalized.chainId !== undefined && session.lastParseInput) return true;
  return false;
}

function buildViewMessagePayload(
  session: AskSession,
  base: Record<string, unknown>,
  locale: NormalizedAskInput["locale"],
): Record<string, unknown> {
  const payload = { ...base };
  if (canDrillIntoCalldata(session.parseResult)) {
    payload.calldataDrillRecommended = true;
    payload.calldataDrillReason =
      locale === "zh"
        ? "交易含合约 Data，需 parse_calldata 解码。"
        : "Transaction has contract Data; run parse_calldata to decode.";
  }
  return payload;
}

async function maybeAutoDrillCalldata(
  session: AskSession,
  normalized: NormalizedAskInput,
  deps: AiPipelineDeps,
  emit: (event: AskSseEvent) => void,
): Promise<ToolActionResult | undefined> {
  if (!canDrillIntoCalldata(session.parseResult)) return undefined;
  return runParseCalldataAction(session, normalized, deps, emit);
}

function ensureParseInput(session: AskSession, normalized: NormalizedAskInput): void {
  const raw = normalized.raw?.trim();
  const previousRaw = session.lastParseInput?.raw?.trim();

  if (raw && (!previousRaw || raw !== previousRaw)) {
    session.lastParseInput = buildParseInputFromAsk({
      raw,
      chainId: normalized.chainId ?? session.lastParseInput?.chainId,
      abi: normalized.abi ?? session.lastParseInput?.abi,
      signerAddress: normalized.signerAddress ?? session.lastParseInput?.signerAddress,
      selectedDiscoveryHit:
        normalized.selectedDiscoveryHit ?? session.lastParseInput?.selectedDiscoveryHit,
      locale: normalized.locale,
    });
    return;
  }

  if (session.lastParseInput) {
    if (normalized.selectedDiscoveryHit || normalized.chainId !== undefined) {
      session.lastParseInput = {
        ...session.lastParseInput,
        ...(normalized.selectedDiscoveryHit
          ? { selectedDiscoveryHit: normalized.selectedDiscoveryHit }
          : {}),
        ...(normalized.chainId !== undefined ? { chainId: normalized.chainId } : {}),
      };
    }
    return;
  }

  if (!raw) return;

  session.lastParseInput = buildParseInputFromAsk({
    raw,
    chainId: normalized.chainId,
    abi: normalized.abi,
    signerAddress: normalized.signerAddress,
    selectedDiscoveryHit: normalized.selectedDiscoveryHit,
    locale: normalized.locale,
  });
}

export function runDetectInputAction(
  session: AskSession,
  normalized: NormalizedAskInput,
): ToolActionResult {
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
    ensureParseInput(session, normalized);
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

  session.lastParseInput = buildParseInputFromAsk({
    raw,
    chainId: normalized.chainId ?? session.lastParseInput?.chainId,
    abi: normalized.abi ?? session.lastParseInput?.abi,
    signerAddress: normalized.signerAddress ?? session.lastParseInput?.signerAddress,
    selectedDiscoveryHit:
      normalized.selectedDiscoveryHit ?? session.lastParseInput?.selectedDiscoveryHit,
    locale: normalized.locale,
  });

  return {
    ok: true,
    message: JSON.stringify({ kind: detected.kind }),
    summary: detected.kind,
  };
}

export async function runBuildViewAction(
  session: AskSession,
  normalized: NormalizedAskInput,
  deps: AiPipelineDeps,
  emit: (event: AskSseEvent) => void,
): Promise<ToolActionResult> {
  ensureParseInput(session, normalized);

  if (!session.lastParseInput) {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "缺少 parse 输入。可先 detect_input，或请用户提供 hash/calldata。"
          : "Missing parse input. Run detect_input or ask the user for hash/calldata.",
    };
  }

  const needsRebuild = shouldRebuildParse(normalized, session);
  if (!needsRebuild && session.parseResult) {
    const drill = await maybeAutoDrillCalldata(session, normalized, deps, emit);
    const title = session.parseResult.view?.title ?? session.parseResult.summary;
    const payload = buildViewMessagePayload(
      session,
      {
        kind: session.parseResult.kind,
        summary: session.parseResult.summary,
        title,
        cached: true,
        ...(drill?.ok ? { autoDrilled: true } : {}),
        hint:
          normalized.locale === "zh"
            ? "已有相同 parse 结果；若要解析新输入，请换 target。"
            : "Cached parse result; use a new target to parse different input.",
      },
      normalized.locale,
    );
    return {
      ok: true,
      message: JSON.stringify(payload),
      summary: title,
    };
  }

  try {
    const result = await assembleParseResult(session.lastParseInput, deps);
    session.parseResult = result;
    emit({ type: "parse_result", result });

    const title = result.view?.title ?? result.summary;

    if (result.view?.discovery?.status === "ambiguous") {
      emit({ type: "needs_input", discovery: result.view.discovery });
      return {
        ok: true,
        message: JSON.stringify({
          kind: result.kind,
          summary: result.summary,
          discovery: "ambiguous",
        }),
        summary: title,
        discovery: result.view.discovery,
      };
    }

    const drill = await maybeAutoDrillCalldata(session, normalized, deps, emit);
    const payload = buildViewMessagePayload(
      session,
      {
        kind: session.parseResult.kind,
        summary: session.parseResult.summary,
        title: session.parseResult.view?.title ?? session.parseResult.summary,
        ...(drill?.ok ? { autoDrilled: true } : {}),
      },
      normalized.locale,
    );

    return {
      ok: true,
      message: JSON.stringify(payload),
      summary: session.parseResult.view?.title ?? session.parseResult.summary,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "build_view failed";
    return { ok: false, message, summary: message };
  }
}

export async function runParseCalldataAction(
  session: AskSession,
  normalized: NormalizedAskInput,
  deps: AiPipelineDeps,
  emit: (event: AskSseEvent) => void,
): Promise<ToolActionResult> {
  if (!session.parseResult) {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "尚无 parseResult。请先 build_view 解析交易。"
          : "No parseResult yet. Run build_view on a transaction first.",
    };
  }

  const { calldata, contractAddress, chainId } = extractCalldataSource(
    session.parseResult,
  );

  if (!calldata) {
    return {
      ok: false,
      message:
        normalized.locale === "zh"
          ? "当前视图没有可解码的 Data/calldata。若用户粘贴了新 hex，请 build_view 新输入。"
          : "No decodable Data on the current view. If the user pasted new hex, use build_view.",
    };
  }

  session.lastParseInput = buildParseInputFromAsk({
    raw: calldata,
    chainId: chainId ?? session.lastParseInput?.chainId,
    abi: session.lastParseInput?.abi,
    signerAddress: contractAddress ?? session.lastParseInput?.signerAddress,
    locale: normalized.locale,
  });

  try {
    const result = await assembleParseResult(session.lastParseInput, deps);
    session.parseResult = result;
    emit({ type: "parse_result", result });
    const title = result.view?.title ?? result.summary;

    return {
      ok: true,
      message: JSON.stringify({
        kind: result.kind,
        summary: result.summary,
        title,
        fromTx: true,
      }),
      summary: title,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "parse_calldata failed";
    return { ok: false, message, summary: message };
  }
}

export { askInputFromNormalized };
