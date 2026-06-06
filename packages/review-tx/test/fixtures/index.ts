import { signedTxFixture } from "./signed_tx.ts";
import { signedTxJsonFixture } from "./signed_tx_json.ts";
import { signedTxNotFoundFixture } from "./signed_tx_not_found.ts";
import type { ReviewFixture } from "./types.ts";
import { unsignedTxFixture } from "./unsigned_tx.ts";
import { unsignedTxHexFixture } from "./unsigned_tx_hex.ts";
import { unsignedTxNoChainIdFixture } from "./unsigned_tx_no_chain_id.ts";
import { unsignedTxNoFromFixture } from "./unsigned_tx_no_from.ts";
import { unsignedTxNoNonceFixture } from "./unsigned_tx_no_nonce.ts";
import { unsignedTxToDataOnlyFixture } from "./unsigned_tx_to_data_only.ts";
import { unsignedWithCalldataFixture } from "./unsigned_with_calldata.ts";

export const REVIEW_FIXTURE_CASES: ReviewFixture[] = [
  signedTxFixture,
  signedTxJsonFixture,
  signedTxNotFoundFixture,
  unsignedTxFixture,
  unsignedTxHexFixture,
  unsignedWithCalldataFixture,
  unsignedTxNoChainIdFixture,
  unsignedTxNoFromFixture,
  unsignedTxToDataOnlyFixture,
  unsignedTxNoNonceFixture,
];

export const FIXTURE_FILE_BY_NAME: Record<string, string> = {
  signedTx: "signed_tx.ts",
  signedTxJson: "signed_tx_json.ts",
  signedTxNotFound: "signed_tx_not_found.ts",
  unsignedTx: "unsigned_tx.ts",
  unsignedTxHex: "unsigned_tx_hex.ts",
  unsignedWithCalldata: "unsigned_with_calldata.ts",
  unsignedTxNoChainId: "unsigned_tx_no_chain_id.ts",
  unsignedTxNoFrom: "unsigned_tx_no_from.ts",
  unsignedTxToDataOnly: "unsigned_tx_to_data_only.ts",
  unsignedTxNoNonce: "unsigned_tx_no_nonce.ts",
};

export type { ReviewFixture } from "./types.ts";
