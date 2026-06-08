import type { ViewResult } from "@beforesign/core";
import type { CalldataCall } from "@beforesign/calldata-parse";
import type { NormalizedTx, OnchainTxMeta } from "@beforesign/core";
import type { ParseTransactionReturnType } from "viem";
import type { Abi } from "viem";

export type TxReviewKind = "signedTx" | "unsignedTx";

export type TxViewInput = {
  kind: TxReviewKind;
  normalized: ParseTransactionReturnType;
  abi?: Abi;
  tx?: NormalizedTx;
  onchain?: OnchainTxMeta;
  indexed?: "found" | "notFound";
  decodedMethod?: string;
  calldataTree?: CalldataCall;
  contractAddress?: string;
};

export type TxViewResult = ViewResult;
