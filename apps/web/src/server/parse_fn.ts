import { createServerFn } from "@tanstack/react-start";
import { parseInputSchema, serializeParseResult } from "@beforesign/core";
import { createDepsFromKeys, parseInput } from "@beforesign/orchestrator";
import { getApiKeys } from "./env.ts";

export const runParse = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => parseInputSchema.parse(data))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const keys = getApiKeys();
    const result = await parseInput(data, createDepsFromKeys(keys));
    return serializeParseResult(result);
  });
