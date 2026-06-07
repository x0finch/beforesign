import { genericBytesFixture } from "./generic_bytes.ts";
import { multicall3Fixture } from "./multicall3.ts";
import { resolveAbiInnerFixture } from "./resolve_abi_inner.ts";
import { safeExecFixture } from "./safe_exec.ts";
import { safeMultisendFixture } from "./safe_multisend.ts";
import { selectorOnlyFixture } from "./selector_only.ts";
import { transferFixture } from "./transfer.ts";
import type { ParseFixture } from "./types.ts";

export const PARSE_FIXTURE_CASES: ParseFixture[] = [
  transferFixture,
  safeExecFixture,
  safeMultisendFixture,
  multicall3Fixture,
  genericBytesFixture,
  resolveAbiInnerFixture,
  selectorOnlyFixture,
];

export const FIXTURE_FILE_BY_NAME: Record<string, string> = {
  transfer: "transfer.ts",
  safeExec: "safe_exec.ts",
  safeMultisend: "safe_multisend.ts",
  multicall3: "multicall3.ts",
  genericBytes: "generic_bytes.ts",
  resolveAbiInner: "resolve_abi_inner.ts",
  selectorOnly: "selector_only.ts",
};

export type { ParseFixture } from "./types.ts";
