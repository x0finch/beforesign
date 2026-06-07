import type { Abi, AbiFunction, Hex } from "viem";
import { decodeFunctionData, slice, toFunctionSelector } from "viem";
import type { CalldataArg, CalldataCall } from "./types.ts";
import {
  formatArgValue,
  inferSimpleType,
  mapAbiComponents,
  mapAbiOutputs,
} from "./utils/format_arg.ts";
import { formatFunctionSignatures } from "./utils/format_signature.ts";

type AbiParameterWithComponents = import("viem").AbiParameter & {
  components?: readonly AbiParameterWithComponents[];
};

function findAbiFunction(abi: Abi, selector: Hex, functionName?: string): AbiFunction | undefined {
  for (const item of abi) {
    if (item.type !== "function") continue;
    try {
      if (toFunctionSelector(item) === selector) return item;
    } catch {
      /* skip invalid abi entries */
    }
  }

  if (functionName) {
    for (const item of abi) {
      if (item.type === "function" && item.name === functionName) return item;
    }
  }

  return undefined;
}

function mapDecodedArgs(abiFn: AbiFunction, decodedArgs: readonly unknown[]): CalldataArg[] {
  return decodedArgs.map((value, index) => {
    const input = abiFn.inputs[index] as AbiParameterWithComponents | undefined;
    return {
      name: input?.name ?? "",
      type: input?.type ?? inferSimpleType(value),
      ...(input?.components?.length
        ? { components: mapAbiComponents(input.components) }
        : {}),
      value,
      displayValue: formatArgValue(value, input),
    };
  });
}

export function decodeLayer(
  data: Hex,
  abi: Abi | undefined,
  depth: number,
): CalldataCall {
  const raw = data.trim() as Hex;
  const selector = slice(raw, 0, 4);

  if (abi) {
    try {
      const decoded = decodeFunctionData({ abi, data: raw });
      const abiFn = findAbiFunction(abi, selector, decoded.functionName);
      const args = abiFn
        ? mapDecodedArgs(abiFn, decoded.args ?? [])
        : (decoded.args ?? []).map((value) => ({
            name: "",
            type: inferSimpleType(value),
            value,
            displayValue: formatArgValue(value),
          }));

      const signatures = abiFn ? formatFunctionSignatures(abiFn) : undefined;
      const outputs = abiFn?.outputs?.length
        ? mapAbiOutputs(abiFn.outputs as readonly AbiParameterWithComponents[])
        : undefined;

      return {
        raw,
        selector,
        depth,
        functionName: decoded.functionName,
        ...(signatures?.signature ? { signature: signatures.signature } : {}),
        ...(signatures?.signatureWithNames
          ? { signatureWithNames: signatures.signatureWithNames }
          : {}),
        args,
        ...(outputs ? { outputs } : {}),
        summary: `Call ${decoded.functionName}`,
        children: [],
      };
    } catch {
      /* fall through to selector-only */
    }
  }

  return {
    raw,
    selector,
    depth,
    args: [],
    summary: `Unknown method (${selector})`,
    children: [],
  };
}

export function selectorOnlyNode(data: Hex, depth: number): CalldataCall {
  const raw = data.trim() as Hex;
  const selector = slice(raw, 0, 4);
  return {
    raw,
    selector,
    depth,
    args: [],
    summary: `Unknown method (${selector})`,
    children: [],
  };
}
