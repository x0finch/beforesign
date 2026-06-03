import type { ParseResult } from "./types.ts";

/** JSON-safe clone for server fn responses (bigint already as string in domain types). */
export function serializeParseResult(result: ParseResult): ParseResult {
  return JSON.parse(JSON.stringify(result)) as ParseResult;
}
