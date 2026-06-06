import { TX_HASH } from "@beforesign/test-fixtures";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const payload = {
  chainId: 8453,
  discovery: {
    status: "resolved" as const,
    hits: [
      {
        id: `1-${TX_HASH}`,
        chainId: 1,
        chainName: "Ethereum",
        from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
        to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      },
    ],
    resolvedChainId: 1,
  },
  tx: {
    chainId: 1,
    from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
    to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
    hash: TX_HASH,
  },
  onchain: {
    chainId: 1,
    status: "success" as const,
    explorerUrl: `https://etherscan.io/tx/${TX_HASH}`,
  },
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "txHash",
  "title": "Transaction",
  "summary": "On-chain transaction: verify hash, chain, counterparties, and calldata",
  "checks": [
    {
      "id": "transaction.chain",
      "group": "default",
      "label": "Chain",
      "value": "1",
      "kind": "chainId",
      "displayValue": "Ethereum",
      "href": "https://etherscan.io/tx/0xbc78ab8a9e9a0bca7d0321a27b2c03addeae08ba81ea98b03cd3dd237eabed44"
    },
    {
      "id": "transaction.from",
      "group": "default",
      "label": "From",
      "value": "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
      "kind": "address"
    },
    {
      "id": "transaction.to",
      "group": "default",
      "label": "To",
      "value": "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      "kind": "address"
    }
  ],
  "warnings": []
} satisfies ReviewDocument;

export const userChainMismatchFixture: ReviewFixture = {
  name: "userChainMismatch",
  hash: TX_HASH,
  payload,
  output,
};
