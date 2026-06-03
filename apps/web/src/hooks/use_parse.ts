import { useState, useCallback } from "react";
import type { ParseInput, ParseResult } from "@beforesign/core";
import { runParse } from "~/server/parse_fn.ts";

export function useParse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);

  const parse = useCallback(async (input: ParseInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = (await runParse({ data: input })) as ParseResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, error, result, parse, clear };
}
