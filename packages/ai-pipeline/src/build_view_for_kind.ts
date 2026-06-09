import type { ClientsBundle } from "@beforesign/clients";
import type { ParseInput, ViewResult } from "@beforesign/core";
import { detectInputType, type DetectResult } from "@beforesign/detect";
import { buildCalldataSpec } from "@beforesign/view-calldata";
import { buildTxSpec } from "@beforesign/view-tx";
import { buildTxHashSpec } from "@beforesign/view-tx-hash";
import { buildTypedDataView } from "@beforesign/view-typed-data";
import type { Abi, Address, Hash, Hex } from "viem";
import type { AiPipelineDeps } from "./types.ts";

export type ViewBuildOptions = {
  debankEnabled?: boolean;
  txLookupEnabled?: boolean;
};

function parseAbi(raw?: string): Abi | undefined {
  if (!raw?.trim()) return undefined;
  try {
    return JSON.parse(raw) as Abi;
  } catch {
    return undefined;
  }
}

export async function buildViewForKind(
  detected: DetectResult,
  clients: ClientsBundle,
  input: ParseInput,
  opts?: ViewBuildOptions,
): Promise<ViewResult | undefined> {
  const abi = parseAbi(input.abi);

  switch (detected.kind) {
    case "typedData":
      return buildTypedDataView(
        {
          normalized: detected.normalized,
          signerAddress: input.signerAddress as Address | undefined,
        },
        clients,
      );
    case "txHash": {
      if (opts?.txLookupEnabled === false) return undefined;
      return buildTxHashSpec(
        {
          hash: detected.normalized as Hash,
          chainId: input.chainId,
          selectedDiscoveryHit: input.selectedDiscoveryHit,
        },
        clients,
      );
    }
    case "signedTx":
      return buildTxSpec(
        {
          kind: "signedTx",
          raw: input.raw,
          normalized: detected.normalized,
          abi,
          selectedChainId: input.chainId,
        },
        clients,
        { debankEnabled: opts?.debankEnabled },
      );
    case "unsignedTx":
      return buildTxSpec(
        {
          kind: "unsignedTx",
          raw: input.raw,
          normalized: detected.normalized,
          abi,
          selectedChainId: input.chainId,
        },
        clients,
        { debankEnabled: opts?.debankEnabled },
      );
    case "calldata":
      return buildCalldataSpec(
        {
          raw: detected.normalized as Hex,
          abi,
          contractAddress: input.signerAddress,
        },
        clients,
      );
    default:
      return undefined;
  }
}

export async function buildViewForInput(
  input: ParseInput,
  deps: AiPipelineDeps,
): Promise<ViewResult | undefined> {
  const detected = detectInputType(input.raw);
  return buildViewForKind(detected, deps, input, {
    debankEnabled: deps.debankEnabled,
    txLookupEnabled: deps.txLookupEnabled,
  });
}
