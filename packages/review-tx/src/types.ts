import type { InputKind, NormalizedTx, OnchainTxMeta } from "@beforesign/core";
import type { Abi } from "viem";

export type TxReviewKind = Extract<InputKind, "signedTx" | "unsignedTx">;

export type TxPayload = {
  kind?: TxReviewKind;
  abi?: Abi;
  tx?: NormalizedTx;
  decodedMethod?: string;
  onchain?: OnchainTxMeta;
  indexed?: "found" | "notFound";
};
