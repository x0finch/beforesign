import { useState, useCallback } from "react";
import type { parse_input, parse_result } from "@beforesign/core";
import { run_parse } from "~/server/parse_fn.ts";

export function use_parse() {
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const [result, set_result] = useState<parse_result | null>(null);

  const parse = useCallback(async (input: parse_input) => {
    set_loading(true);
    set_error(null);
    try {
      const data = (await run_parse({ data: input })) as parse_result;
      set_result(data);
    } catch (e) {
      set_error(e instanceof Error ? e.message : "Parse failed");
      set_result(null);
    } finally {
      set_loading(false);
    }
  }, []);

  const clear = useCallback(() => {
    set_result(null);
    set_error(null);
  }, []);

  return { loading, error, result, parse, clear };
}
