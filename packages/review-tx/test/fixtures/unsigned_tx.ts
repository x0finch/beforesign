import { UNSIGNED_TX_JSON } from "./inputs.ts";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const payload = {
  kind: "unsignedTx" as const,
  tx: {
    chainId: 1,
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    value: "0",
    data: "0x",
  },
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "unsignedTx",
  "title": "Transaction",
  "summary": "Unsigned transaction: verify chain, counterparties, and calldata before signing",
  "checks": [
    {
      "id": "transaction.chain",
      "group": "default",
      "label": "Chain",
      "value": "1",
      "kind": "chainId",
      "displayValue": "Ethereum"
    },
    {
      "id": "transaction.to",
      "group": "default",
      "label": "To",
      "value": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "kind": "address"
    },
    {
      "id": "transaction.data",
      "group": "default",
      "label": "Data",
      "value": "0x",
      "kind": "text",
      "displayValue": "0x (empty)"
    }
  ],
  "warnings": []
} satisfies ReviewDocument;

export const unsignedTxFixture: ReviewFixture = {
  name: "unsignedTx",
  input: UNSIGNED_TX_JSON,
  kind: "unsignedTx",
  payload,
  output,
};
