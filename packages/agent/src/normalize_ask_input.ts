import type { InputKind } from "@beforesign/core";
import { detectInputType, normalizeRawInputToJson } from "@beforesign/detect";
import type { AskInput } from "./types.ts";

export type ParseTargetSource = "raw" | "message" | "embedded" | "none";

export type NormalizedAskInput = AskInput & {
  detectedKind: InputKind | "unknown";
  parseTargetSource: ParseTargetSource;
};

function isRecognizedRaw(raw: string): boolean {
  return detectInputType(raw).kind !== "unknown";
}

function extractEmbeddedRaw(message: string): string | undefined {
  const trimmed = message.trim();
  if (!trimmed) return undefined;

  if (isRecognizedRaw(trimmed)) return trimmed;

  const jsonified = normalizeRawInputToJson(trimmed);
  if (jsonified && isRecognizedRaw(jsonified)) return jsonified;

  const hexMatches = [...trimmed.matchAll(/0x[0-9a-fA-F]+/g)]
    .map((match) => match[0])
    .sort((a, b) => b.length - a.length);

  for (const hex of hexMatches) {
    if (isRecognizedRaw(hex)) return hex;
  }

  return undefined;
}

function resolveParseTarget(input: AskInput): {
  raw?: string;
  source: ParseTargetSource;
} {
  const message = input.message.trim();
  const explicitRaw = input.raw?.trim();

  if (explicitRaw && isRecognizedRaw(explicitRaw)) {
    return { raw: explicitRaw, source: "raw" };
  }

  if (message && isRecognizedRaw(message)) {
    return { raw: message, source: "message" };
  }

  const fromMessage = extractEmbeddedRaw(message);
  if (fromMessage) {
    return { raw: fromMessage, source: "embedded" };
  }

  if (explicitRaw) {
    const fromRaw = extractEmbeddedRaw(explicitRaw);
    if (fromRaw) return { raw: fromRaw, source: "embedded" };
    return { raw: explicitRaw, source: "raw" };
  }

  return { source: "none" };
}

export function normalizeAskInput(input: AskInput): NormalizedAskInput {
  const { raw, source } = resolveParseTarget(input);
  const detectedKind = raw ? detectInputType(raw).kind : "unknown";

  return {
    ...input,
    ...(raw ? { raw } : {}),
    detectedKind,
    parseTargetSource: source,
  };
}
