import type { CalldataArg } from "../types.ts";

export function argFieldId(prefix: string, argIndex: number): string {
  return `${prefix}.args.${argIndex}`;
}

export function argFieldLabel(arg: CalldataArg, argIndex: number): string {
  if (arg.name) return arg.name;
  return `#${argIndex} ${arg.type}`;
}

export function arrayElementLabel(arrayType: string, index: number): string {
  const elementType = arrayType.endsWith("[]") ? arrayType.slice(0, -2) : arrayType;
  return `${elementType}[${index}]`;
}
