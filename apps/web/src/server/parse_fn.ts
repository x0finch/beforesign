import { createServerFn } from "@tanstack/react-start";
import { parse_input_schema, serialize_parse_result } from "@beforesign/core";
import { create_deps_from_keys, parse_input } from "@beforesign/orchestrator";
import { get_api_keys } from "./env.ts";

export const run_parse = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => parse_input_schema.parse(data))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const keys = get_api_keys();
    const result = await parse_input(data, create_deps_from_keys(keys));
    return serialize_parse_result(result);
  });
