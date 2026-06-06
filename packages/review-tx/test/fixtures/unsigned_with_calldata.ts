import { CALLDATA_HEX } from "./inputs.ts";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const TO = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const input = JSON.stringify({
  from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  to: TO,
  data: CALLDATA_HEX,
  value: "0x0",
  chainId: "0x1",
  nonce: "0x0",
  gas: "0x5208",
  maxFeePerGas: "0x4e3b29200",
  maxPriorityFeePerGas: "0x4e3b29200",
  type: "0x2",
});

const payload = {
  kind: "unsignedTx" as const,
  tx: {
    chainId: 1,
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: TO,
    value: "0",
    data: CALLDATA_HEX,
  },
  decodedMethod: "transfer(address,uint256)",
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
      "value": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "kind": "address"
    },
    {
      "id": "transaction.data",
      "group": "default",
      "label": "Data",
      "value": "0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000000000001",
      "kind": "hash"
    },
    {
      "id": "calldata.function",
      "group": "default",
      "label": "Function",
      "value": "transfer(address,uint256)",
      "kind": "text"
    }
  ],
  "warnings": []
} satisfies ReviewDocument;

export const unsignedWithCalldataFixture: ReviewFixture = {
  name: "unsignedWithCalldata",
  input,
  kind: "unsignedTx",
  payload,
  output,
};
