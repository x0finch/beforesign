import { decodeFunctionData, slice } from "viem";
import type { CalldataDecode } from "@beforesign/core";
import type { Abi } from "viem";

export function parseCalldata(
  data: string,
  opts?: { abi?: Abi; contractAddress?: string },
): CalldataDecode {
  const raw = data.trim();
  const selector = slice(raw as `0x${string}`, 0, 4);

  if (opts?.abi) {
    try {
      const decoded = decodeFunctionData({ abi: opts.abi, data: raw as `0x${string}` });
      const args = (decoded.args ?? []).map((value, i) => ({
        name: `arg_${i}`,
        type: "unknown",
        value: String(value),
      }));
      return {
        selector,
        functionName: decoded.functionName,
        args,
        raw,
        summary: `调用 ${decoded.functionName}`,
      };
    } catch {
      /* fall through */
    }
  }

  return {
    selector,
    raw,
    args: [],
    summary: `调用未知方法 (${selector})`,
  };
}
