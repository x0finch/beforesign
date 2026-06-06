import { ambiguousFixture } from "./ambiguous.ts";
import { notFoundFixture } from "./not_found.ts";
import { rawInputTruncatedFixture } from "./raw_input_truncated.ts";
import { resolvedNativeTransferFixture } from "./resolved_native_transfer.ts";
import { resolvedWithCalldataFixture } from "./resolved_with_calldata.ts";
import type { ReviewFixture } from "./types.ts";
import { userChainMismatchFixture } from "./user_chain_mismatch.ts";

export const REVIEW_FIXTURE_CASES: ReviewFixture[] = [
  resolvedWithCalldataFixture,
  resolvedNativeTransferFixture,
  notFoundFixture,
  ambiguousFixture,
  rawInputTruncatedFixture,
  userChainMismatchFixture,
];

export const FIXTURE_FILE_BY_NAME: Record<string, string> = {
  resolvedWithCalldata: "resolved_with_calldata.ts",
  resolvedNativeTransfer: "resolved_native_transfer.ts",
  notFound: "not_found.ts",
  ambiguous: "ambiguous.ts",
  rawInputTruncated: "raw_input_truncated.ts",
  userChainMismatch: "user_chain_mismatch.ts",
};

export type { ReviewFixture } from "./types.ts";
