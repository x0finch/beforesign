import type { AbiFunction, AbiParameter } from "viem";

type AbiParameterWithComponents = AbiParameter & {
  components?: readonly AbiParameterWithComponents[];
};

function formatTypeList(items: readonly AbiParameterWithComponents[], withNames: boolean): string {
  return items
    .map((item) => {
      const type = formatParameterType(item);
      if (!withNames || !item.name) return type;
      return `${type} ${item.name}`;
    })
    .join(",");
}

function formatParameterType(item: AbiParameterWithComponents): string {
  if (item.type === "tuple" && item.components?.length) {
    return `(${formatTypeList(item.components, false)})${item.type.endsWith("[]") ? "[]" : ""}`;
  }
  return item.type;
}

export function formatFunctionSignature(abiFn: AbiFunction, withNames = false): string {
  const inputs = formatTypeList(abiFn.inputs, withNames);
  return `${abiFn.name}(${inputs})`;
}

export function formatFunctionSignatures(abiFn: AbiFunction): {
  signature: string;
  signatureWithNames?: string;
} {
  const signature = formatFunctionSignature(abiFn, false);
  const hasNamedInputs = abiFn.inputs.some((input) => Boolean(input.name));
  return {
    signature,
    ...(hasNamedInputs ? { signatureWithNames: formatFunctionSignature(abiFn, true) } : {}),
  };
}
