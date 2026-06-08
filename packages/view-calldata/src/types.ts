import type { ViewResult } from "@beforesign/core";
import type { Abi, Hex } from "viem";

export type CalldataViewInput = {
  raw: Hex;
  abi?: Abi;
  contractAddress?: string;
};

export type CalldataViewResult = ViewResult;
