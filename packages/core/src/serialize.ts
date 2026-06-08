import type { ParseResult } from "./types.ts";

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  return value;
}

/** JSON-safe clone for server fn responses (e.g. TanStack Start server fn wire format). */
export function serializeParseResult(result: ParseResult): ParseResult {
  return JSON.parse(JSON.stringify(result, jsonReplacer)) as ParseResult;
}
