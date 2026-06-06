import { SIGNED_TX_FROM, SIGNED_TX_HEX, SIGNED_TX_JSON } from "./inputs.ts";
import type { ReviewDocument } from "@beforesign/core";
import { keccak256 } from "viem";
import type { ReviewFixture } from "./types.ts";

const HASH = keccak256(SIGNED_TX_HEX);

const payload = {
  kind: "signedTx" as const,
  indexed: "found" as const,
  tx: {
    chainId: 1,
    from: SIGNED_TX_FROM,
    to: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    value: "0",
    data: "0x",
    hash: HASH,
  },
  onchain: {
    chainId: 1,
    blockNumber: "13579024",
    status: "success" as const,
    explorerUrl: `https://etherscan.io/tx/${HASH}`,
  },
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "signedTx",
  "title": "Transaction",
  "summary": "Signed transaction: verify chain, counterparties, and calldata",
  "checks": [
    {
      "id": "transaction.chain",
      "group": "default",
      "label": "Chain",
      "value": "1",
      "kind": "chainId",
      "displayValue": "Ethereum",
      "href": "https://etherscan.io/tx/0x95a8426d0a1cf2b119beae5abe04be99b00010f83561fbb2a10c8cd9782eef80",
      "badge": "13579024",
      "badgeVariant": "success"
    },
    {
      "id": "transaction.from",
      "group": "default",
      "label": "From",
      "value": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "kind": "address"
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

export const signedTxJsonFixture: ReviewFixture = {
  name: "signedTxJson",
  input: SIGNED_TX_JSON,
  kind: "signedTx",
  payload,
  output,
};
