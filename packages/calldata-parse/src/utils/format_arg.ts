import type { AbiParameter } from "viem";

type AbiParameterWithComponents = AbiParameter & {
  components?: readonly AbiParameterWithComponents[];
};

export function inferSimpleType(value: unknown): string {
  if (typeof value === "boolean") return "bool";
  if (typeof value === "bigint") return "uint256";
  if (typeof value === "number") return "uint256";
  if (typeof value === "string") {
    if (value.startsWith("0x") && value.length === 42) return "address";
    if (/^\d+$/.test(value)) return "uint256";
    if (value.startsWith("0x")) return "bytes";
    return "string";
  }
  if (Array.isArray(value)) return "tuple[]";
  if (typeof value === "object" && value !== null) return "tuple";
  return "unknown";
}

export function formatArgValue(value: unknown, input?: AbiParameterWithComponents): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return `[${value.map((item) => formatArgValue(item)).join(", ")}]`;
  }
  if (typeof value === "object") {
    if (input?.components?.length) {
      const record = value as Record<string, unknown>;
      const parts = input.components.map((component, index) => {
        const key = component.name || String(index);
        const nested = record[key] ?? (value as unknown[])[index];
        return `${key}=${formatArgValue(nested, component)}`;
      });
      return `(${parts.join(", ")})`;
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export function fallbackArgName(index: number): string {
  return `arg$${index}`;
}

export function mapAbiComponents(
  components: readonly AbiParameterWithComponents[],
): import("../types.ts").CalldataArgComponent[] {
  return components.map((component) => ({
    name: component.name ?? "",
    type: component.type,
    ...(component.components?.length
      ? { components: mapAbiComponents(component.components) }
      : {}),
  }));
}

export function mapAbiOutputs(
  outputs: readonly AbiParameterWithComponents[],
): import("../types.ts").CalldataOutput[] {
  return outputs.map((output) => ({
    name: output.name ?? "",
    type: output.type,
    ...(output.components?.length
      ? { components: mapAbiComponents(output.components) }
      : {}),
  }));
}
