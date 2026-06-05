import type { TypedDataDefinition } from "viem";
import type { TokenHint } from "../token_hints.ts";

export type TypedDataScenarioId =
  | "tokenPermit"
  | "permit2"
  | "order"
  | "governance"
  | "auth"
  | "generic";

export type TypedDataPayload = {
  signerAddress?: `0x${string}`;
};

export type TypedDataContext = {
  normalized: TypedDataDefinition;
  signableHash: `0x${string}`;
  payload?: TypedDataPayload;
  domain: Record<string, unknown>;
  message: Record<string, unknown>;
  primaryFieldNames: string[];
  tokenHintsByAddress?: Record<string, TokenHint>;
  tokenHint?: TokenHint;
};
