import type { ParseResult, ViewSpec } from "@beforesign/core";

const DRILLABLE_KINDS = new Set<ParseResult["kind"]>([
  "txHash",
  "signedTx",
  "unsignedTx",
]);

function specFieldValue(spec: ViewSpec, label: string): string | null {
  for (const element of Object.values(spec.elements)) {
    if (!element || typeof element !== "object") continue;
    const typed = element as { type?: string; props?: Record<string, unknown> };
    if (typed.type !== "Field") continue;
    if (typed.props?.label !== label) continue;
    const value = typed.props.value;
    return typeof value === "string" ? value : null;
  }
  return null;
}

function rawTxData(raw: ParseResult["raw"]): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw.data;
  return typeof data === "string" ? data : null;
}

function isUsableCalldata(value: string | null | undefined): value is string {
  return Boolean(value && value.startsWith("0x") && value !== "0x" && value.length >= 10);
}

export function canDrillIntoCalldata(result: ParseResult | undefined): boolean {
  if (!result || !DRILLABLE_KINDS.has(result.kind)) return false;
  const { calldata } = extractCalldataSource(result);
  return isUsableCalldata(calldata);
}

export function extractCalldataSource(result: ParseResult): {
  calldata: string | null;
  contractAddress: string | null;
  chainId: number | undefined;
} {
  const chainId = result.view?.chainId;
  let calldata: string | null = null;
  let contractAddress: string | null = null;

  if (result.view?.spec) {
    calldata = specFieldValue(result.view.spec, "Data");
    contractAddress = specFieldValue(result.view.spec, "To");
  }

  if (!isUsableCalldata(calldata)) {
    const fromRaw = rawTxData(result.raw);
    if (isUsableCalldata(fromRaw)) calldata = fromRaw;
  }

  if (!isUsableCalldata(calldata)) {
    return { calldata: null, contractAddress, chainId };
  }

  return { calldata, contractAddress, chainId };
}
