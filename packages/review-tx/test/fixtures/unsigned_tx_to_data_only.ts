import { CALLDATA_HEX, UNSIGNED_TX_JSON_TO_DATA_ONLY } from "./inputs.ts";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const TO = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const payload = {
  kind: "unsignedTx" as const,
  tx: {
    to: TO,
    data: CALLDATA_HEX,
  },
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "unsignedTx",
  "title": "Transaction",
  "summary": "Unsigned transaction: verify chain, counterparties, and calldata before signing",
  "checks": [
    {
      "id": "transaction.to",
      "group": "default",
      "label": "To",
      "value": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "kind": "address"
    },
    {
      "id": "transaction.data",
      "group": "default",
      "label": "Data",
      "value": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001",
      "kind": "hash"
    }
  ],
  "warnings": []
} satisfies ReviewDocument;

export const unsignedTxToDataOnlyFixture: ReviewFixture = {
  name: "unsignedTxToDataOnly",
  input: UNSIGNED_TX_JSON_TO_DATA_ONLY,
  kind: "unsignedTx",
  payload,
  output,
};
