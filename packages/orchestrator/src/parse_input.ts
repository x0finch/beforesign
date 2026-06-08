import type { ParseInput, ParseResult } from "@beforesign/core";
import { serializeParseResult } from "@beforesign/core";
import type { ClientsBundle } from "@beforesign/clients";
import { resolveChainId } from "@beforesign/clients";
import { detectInputType } from "@beforesign/detect";
import { runRiskRules } from "./risk_rules.ts";
import type { Abi, Address, Hash, Hex } from "viem";
import { buildParseResult } from "./build_parse_result.ts";
import { parseCalldataContext, type CalldataContext } from "./enrich/calldata.ts";
import { prepareSignedTx } from "./enrich/signed_tx.ts";
import { prepareTxHash } from "./enrich/tx_hash.ts";
import { canSimulateDebank } from "./simulate.ts";
import { mergeWarnings } from "./merge_warnings.ts";
import { runView } from "./run_view.ts";

export type ParseInputDeps = ClientsBundle & {
  txLookupEnabled?: boolean;
  etherscanEnabled?: boolean;
  debankEnabled?: boolean;
};

function parseAbi(raw?: string): Abi | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return JSON.parse(raw) as Abi;
  } catch {
    return undefined;
  }
}

export async function parseInput(input: ParseInput, deps: ParseInputDeps): Promise<ParseResult> {
  const detected = detectInputType(input.raw);
  const { kind } = detected;
  const abi = parseAbi(input.abi);
  const result = buildParseResult(detected, input.raw);

  const apiErrors: string[] = [];
  let calldataCtx: CalldataContext | undefined;
  let signedTxPrepared: Awaited<ReturnType<typeof prepareSignedTx>> | undefined;

  async function attachCalldata(data: Hex, contractAddress?: string) {
    calldataCtx = await parseCalldataContext(data, deps, {
      abi,
      ...(contractAddress ? { contractAddress: contractAddress as Address } : {}),
    });
    result.calldata = calldataCtx.decode;
    if (calldataCtx.decode.summary) {
      result.summary = calldataCtx.decode.summary;
      result.summaryEn = calldataCtx.decode.summary;
    }
  }

  if (kind === "calldata") {
    await attachCalldata(detected.normalized as Hex);
  }

  if (kind === "txHash" && deps.txLookupEnabled !== false) {
    try {
      const hash = input.raw.trim() as Hash;
      const prepared = await prepareTxHash(hash, deps, {
        chainId: input.chainId,
        selectedDiscoveryHit: input.selectedDiscoveryHit,
      });
      result.discovery = prepared.discovery;
      result.tx = prepared.tx;
      result.onchain = prepared.onchain;
      if (prepared.decodedMethod || prepared.timestamp) {
        result.txHashEnrichment = {
          decodedMethod: prepared.decodedMethod,
          timestamp: prepared.timestamp,
        };
      }
      if (prepared.tx?.data) {
        await attachCalldata(prepared.tx.data as Hex, prepared.tx.to);
      }
      if (prepared.tx && prepared.onchain) {
        result.summary = "已上链交易";
        result.summaryEn = "On-chain transaction";
      } else if (
        !resolveChainId(prepared.discovery, input.chainId, input.selectedDiscoveryHit)
      ) {
        result.summary = "请选择链或匹配结果";
        result.summaryEn = "Select chain or pick a discovery match";
      }
    } catch (e) {
      apiErrors.push(`Tenderly: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  if (kind === "signedTx") {
    try {
      signedTxPrepared = await prepareSignedTx(detected.normalized, deps, result.tx);
      result.tx = signedTxPrepared.tx;
      result.onchain = signedTxPrepared.onchain ?? result.onchain;
    } catch (e) {
      apiErrors.push(`Tx lookup: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  if ((kind === "signedTx" || kind === "unsignedTx") && result.tx?.data) {
    await attachCalldata(result.tx.data as Hex, result.tx.to);
  }

  if (kind === "unsignedTx" && canSimulateDebank(result.tx) && deps.debankEnabled !== false) {
    try {
      result.simulation = await deps.debank.preExecTx(result.tx!);
      const explanation = await deps.debank.explainTx(result.tx!);
      if (explanation) {
        result.explanation = explanation;
        result.summary = explanation;
      }
    } catch (e) {
      apiErrors.push(`DeBank: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  const view = await runView(detected, deps, input, result, {
    calldataCtx,
    signedTx: signedTxPrepared,
  });
  if (view) {
    result.view = view;
    if (view.warnings?.length) {
      result.warnings = mergeWarnings(result.warnings, view.warnings);
    }
  }

  const riskWarnings = runRiskRules(result, {
    selectedChainId: input.chainId,
  });
  result.warnings = mergeWarnings(result.warnings, riskWarnings);

  if (apiErrors.length > 0) {
    for (const msg of apiErrors) {
      result.warnings.push({
        code: "apiError",
        severity: "warning",
        message: msg,
      });
    }
  }

  return serializeParseResult(result);
}
