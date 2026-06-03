import type { parse_result } from "./types.ts";

/** JSON-safe clone for server fn responses (bigint already as string in domain types). */
export function serialize_parse_result(result: parse_result): parse_result {
  return JSON.parse(JSON.stringify(result)) as parse_result;
}
