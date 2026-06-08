import type { Abi, Hex } from "viem";
import { parseAbiItem } from "viem";

const DEDAUB_DEFAULT = "https://app.dedaub.com/api/search/function";
const FOURBYTE_DEFAULT = "https://www.4byte.directory/api/v1/signatures/";

type DedaubFunctionItem = {
  selector?: string;
  signature?: string;
  name?: string;
  type?: string;
  inputs?: unknown[];
  outputs?: unknown[];
  stateMutability?: string;
  payable?: unknown;
  constant?: unknown;
};

type FourByteResult = {
  id: number;
  text_signature: string;
};

export type SignatureLookupClient = {
  resolveBySelector: (selector: Hex) => Promise<Abi | undefined>;
};

function normalizeSelector(selector: string): string {
  const hex = selector.toLowerCase();
  return hex.startsWith("0x") ? hex : `0x${hex}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dedaubItemToAbi(item: DedaubFunctionItem): Abi | undefined {
  if (item.type !== "function" || !item.name) return undefined;
  const { payable, constant, selector: _selector, signature: _signature, ...rest } = item;
  void payable;
  void constant;
  void _selector;
  void _signature;
  return [rest as Abi[number]];
}

function parseDedaubBody(text: string, selector: string): Abi | undefined {
  const trimmed = text.trim();
  if (!trimmed || trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return undefined;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return undefined;

  const item =
    (parsed as DedaubFunctionItem[]).find(
      (entry) => entry.selector?.toLowerCase() === selector,
    ) ?? (parsed[0] as DedaubFunctionItem);

  return dedaubItemToAbi(item);
}

export function pickFourByteSignature(results: FourByteResult[]): string | undefined {
  if (results.length === 0) return undefined;

  const sorted = [...results].sort(
    (a, b) =>
      a.text_signature.length - b.text_signature.length || a.id - b.id,
  );
  return sorted[0]?.text_signature;
}

function fourByteResultsToAbi(results: FourByteResult[]): Abi | undefined {
  const textSignature = pickFourByteSignature(results);
  if (!textSignature) return undefined;
  try {
    return [parseAbiItem(`function ${textSignature}`)] as Abi;
  } catch {
    return undefined;
  }
}

export function createSignatureLookupClient(opts?: {
  fetchFn?: typeof fetch;
  dedaubBaseUrl?: string;
  fourByteBaseUrl?: string;
  minIntervalMs?: number;
  maxConcurrent?: number;
  maxRetries?: number;
}): SignatureLookupClient {
  const fetchFn = opts?.fetchFn ?? fetch;
  const dedaubBaseUrl = opts?.dedaubBaseUrl ?? DEDAUB_DEFAULT;
  const fourByteBaseUrl = opts?.fourByteBaseUrl ?? FOURBYTE_DEFAULT;
  const minIntervalMs = opts?.minIntervalMs ?? 300;
  const maxConcurrent = opts?.maxConcurrent ?? 2;
  const maxRetries = opts?.maxRetries ?? 2;

  const cache = new Map<string, Abi | undefined>();
  const inflight = new Map<string, Promise<Abi | undefined>>();
  let active = 0;
  let lastRequestAt = 0;
  let queue: Promise<void> = Promise.resolve();

  async function gate<T>(fn: () => Promise<T>): Promise<T> {
    const run = async () => {
      while (active >= maxConcurrent) {
        await sleep(10);
      }
      active += 1;
      try {
        const now = Date.now();
        const waitMs = Math.max(0, minIntervalMs - (now - lastRequestAt));
        if (waitMs > 0) await sleep(waitMs);
        lastRequestAt = Date.now();
        return await fn();
      } finally {
        active -= 1;
      }
    };

    const result = queue.then(run, run);
    queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function fetchWithRetry(url: string): Promise<Response | undefined> {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const response = await gate(() => fetchFn(url));
      if (response.status === 429 || response.status === 503) {
        if (attempt < maxRetries) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        return undefined;
      }
      return response;
    }
    return undefined;
  }

  async function lookupDedaub(selector: string): Promise<Abi | undefined> {
    const url = `${dedaubBaseUrl}?selector=${selector}`;
    const response = await fetchWithRetry(url);
    if (!response?.ok) return undefined;
    const text = await response.text();
    return parseDedaubBody(text, selector);
  }

  async function lookupFourByte(selector: string): Promise<Abi | undefined> {
    const url = `${fourByteBaseUrl}?hex_signature=${selector}`;
    const response = await fetchWithRetry(url);
    if (!response?.ok) return undefined;

    let body: { results?: FourByteResult[] };
    try {
      body = (await response.json()) as { results?: FourByteResult[] };
    } catch {
      return undefined;
    }

    return fourByteResultsToAbi(body.results ?? []);
  }

  async function lookup(selector: string): Promise<Abi | undefined> {
    const dedaub = await lookupDedaub(selector);
    if (dedaub) return dedaub;
    return lookupFourByte(selector);
  }

  return {
    async resolveBySelector(selector: Hex): Promise<Abi | undefined> {
      const key = normalizeSelector(selector);
      if (cache.has(key)) return cache.get(key);

      const pending = inflight.get(key);
      if (pending) return pending;

      const promise = lookup(key)
        .catch(() => undefined)
        .then((abi) => {
          cache.set(key, abi);
          return abi;
        })
        .finally(() => {
          inflight.delete(key);
        });

      inflight.set(key, promise);
      return promise;
    },
  };
}
