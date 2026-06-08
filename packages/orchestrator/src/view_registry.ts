import { buildCalldataSpec } from "@beforesign/view-calldata";
import { buildTxSpec } from "@beforesign/view-tx";
import { buildTxHashSpec } from "@beforesign/view-tx-hash";
import { buildTypedDataSpec } from "@beforesign/view-typed-data";

export const viewBuilders = {
  typedData: buildTypedDataSpec,
  txHash: buildTxHashSpec,
  signedTx: buildTxSpec,
  unsignedTx: buildTxSpec,
  calldata: buildCalldataSpec,
} as const;
