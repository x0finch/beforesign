import type { CalldataUnwrapper } from "../types.ts";
import { genericBytesUnwrapper } from "./multicall_aggregate.ts";
import {
  multicallAggregate3Unwrapper,
  multicallAggregateUnwrapper,
  multicallTryAggregateUnwrapper,
} from "./multicall_aggregate.ts";
import { safeExecTransactionUnwrapper } from "./safe_exec_transaction.ts";
import { safeMultiSendUnwrapper } from "./safe_multi_send.ts";

export const DEFAULT_UNWRAPPERS: CalldataUnwrapper[] = [
  safeExecTransactionUnwrapper,
  safeMultiSendUnwrapper,
  multicallAggregateUnwrapper,
  multicallAggregate3Unwrapper,
  multicallTryAggregateUnwrapper,
  genericBytesUnwrapper,
];

export function sortedUnwrappers(extra?: CalldataUnwrapper[]): CalldataUnwrapper[] {
  return [...DEFAULT_UNWRAPPERS, ...(extra ?? [])].sort((a, b) => a.priority - b.priority);
}
