import type { ViewResult } from "@beforesign/core";
import type { CalldataCall } from "@beforesign/calldata-parse";

export type CalldataViewInput = {
  tree: CalldataCall;
  contractAddress?: string;
};

export type CalldataViewResult = ViewResult;
