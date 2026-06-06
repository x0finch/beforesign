import { decodeFunctionData, slice, toFunctionSelector, type Abi, type AbiFunction } from "viem";

function formatFunctionSignature(item: AbiFunction): string {
  const inputs = item.inputs.map((input) => input.type).join(",");
  return `${item.name}(${inputs})`;
}

export function resolveDecodedMethod(
  data: string | undefined,
  abi?: Abi,
  decodedMethod?: string,
): string | undefined {
  if (decodedMethod) return decodedMethod;
  if (!data || data === "0x" || !abi) return undefined;

  try {
    const decoded = decodeFunctionData({ abi, data: data as `0x${string}` });
    const selector = slice(data as `0x${string}`, 0, 4);

    for (const item of abi) {
      if (item.type !== "function") continue;
      try {
        if (toFunctionSelector(item) === selector) {
          return formatFunctionSignature(item);
        }
      } catch {
        /* skip invalid abi entries */
      }
    }

    return decoded.functionName;
  } catch {
    return undefined;
  }
}
