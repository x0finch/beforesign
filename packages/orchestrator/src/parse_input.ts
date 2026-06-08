import type { ParseInput, ParseResult } from "@beforesign/core";
import { serializeParseResult } from "@beforesign/core";
import type { ClientsBundle } from "@beforesign/clients";
import { resolveChainId } from "@beforesign/clients";
import { detectInputType } from "@beforesign/detect";
import { canSimulateDebank, parseLocally, parseCalldata } from "@beforesign/parse";
import { runRiskRules } from "./risk_rules.ts";

export type ParseInputDeps = ClientsBundle & {
  blockscoutEnabled?: boolean;
  etherscanEnabled?: boolean;
  debankEnabled?: boolean;
};

export async function parseInput(input: ParseInput, deps: ParseInputDeps): Promise<ParseResult> {
  const { kind } = detectInputType(input.raw);
  const result = parseLocally(kind, input.raw, {
    abi: input.abi,
  });

  const apiErrors: string[] = [];

  if (kind === "txHash" && deps.blockscoutEnabled !== false) {
    try {
      const discovery = await deps.blockscout.searchQuick(input.raw.trim());
      result.discovery = discovery;
      const chainId = resolveChainId(
        discovery,
        input.chainId,
        input.selectedDiscoveryHit,
      );

      if (chainId && deps.etherscanEnabled !== false) {
        try {
          const { tx, onchain } = await deps.etherscan.getTransaction(
            chainId,
            input.raw.trim(),
          );
          result.tx = tx;
          result.onchain = onchain;
          result.kind = "signedTx";
          if (tx.data) {
            let parsedAbi;
            try {
              parsedAbi = input.abi ? JSON.parse(input.abi) : undefined;
            } catch {
              parsedAbi = undefined;
            }
            result.calldata = parseCalldata(tx.data, {
              abi: parsedAbi,
              contractAddress: tx.to,
            });
          }
          result.summary = "已上链交易";
          result.summaryEn = "On-chain transaction";
        } catch (e) {
          apiErrors.push(`Etherscan: ${e instanceof Error ? e.message : "failed"}`);
        }
      } else if (!chainId) {
        result.summary = "请选择链或匹配结果";
        result.summaryEn = "Select chain or pick a discovery match";
      }
    } catch (e) {
      apiErrors.push(`Blockscout: ${e instanceof Error ? e.message : "failed"}`);
      if (input.chainId && deps.etherscanEnabled !== false) {
        try {
          const { tx, onchain } = await deps.etherscan.getTransaction(
            input.chainId,
            input.raw.trim(),
          );
          result.tx = tx;
          result.onchain = onchain;
          result.kind = "signedTx";
          result.summary = "已上链交易";
          result.summaryEn = "On-chain transaction";
        } catch (err) {
          apiErrors.push(`Etherscan: ${err instanceof Error ? err.message : "failed"}`);
        }
      }
    }
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

  const riskWarnings = runRiskRules(result, {
    selectedChainId: input.chainId,
  });
  result.warnings = [...result.warnings, ...riskWarnings];

  if (apiErrors.length > 0) {
    for (const msg of apiErrors) {
      result.warnings.push({
        code: "apiError",
        severity: "warning",
        message: msg,
        messageEn: msg,
      });
    }
  }

  return serializeParseResult(result);
}
