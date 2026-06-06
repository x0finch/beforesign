import { UNSIGNED_TX_JSON_NO_FROM } from "./inputs.ts";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const payload = {
  kind: "unsignedTx" as const,
  tx: {
    chainId: 1,
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

export const unsignedTxNoFromFixture: ReviewFixture = {
  name: "unsignedTxNoFrom",
  input: UNSIGNED_TX_JSON_NO_FROM,
  kind: "unsignedTx",
  payload,
  output,
};
