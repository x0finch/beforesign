import type { NormalizedTx, OnchainTxMeta, ViewResult } from "@beforesign/core";
import type { ParseTransactionReturnType } from "viem";
import type { Abi } from "viem";

export type TxReviewKind = "signedTx" | "unsignedTx";

export type TxViewInput = {
  kind: TxReviewKind;
  raw: string;
  normalized: ParseTransactionReturnType;
  abi?: Abi;
  selectedChainId?: number;
};

export type TxFieldContext = {
  kind: TxReviewKind;
  normalized: ParseTransactionReturnType;
  abi?: Abi;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  indexed?: "found" | "notFound";
  decodedMethod?: string;
};

export type TxViewResult = ViewResult;

export type TxViewOptions = {
  debankEnabled?: boolean;
};
