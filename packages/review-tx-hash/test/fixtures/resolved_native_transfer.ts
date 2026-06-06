import { BLOCKSCOUT_TX_V2_NATIVE, TX_HASH } from "@beforesign/test-fixtures";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const FROM = "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8";
const TO = "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f";

const payload = {
  discovery: {
    status: "resolved" as const,
    hits: [
      {
        id: `1-${TX_HASH}`,
        chainId: 1,
        chainName: "Ethereum",
        blockNumber: BLOCKSCOUT_TX_V2_NATIVE.block_number,
        from: FROM,
        to: TO,
        timestamp: BLOCKSCOUT_TX_V2_NATIVE.timestamp,
      },
    ],
    resolvedChainId: 1,
  },
  tx: {
    chainId: 1,
    from: FROM,
    to: TO,
    value: BLOCKSCOUT_TX_V2_NATIVE.value,
    data: "0x",
    nonce: BLOCKSCOUT_TX_V2_NATIVE.nonce,
    hash: TX_HASH,
  },
  onchain: {
    chainId: 1,
    blockNumber: String(BLOCKSCOUT_TX_V2_NATIVE.block_number),
    status: "success" as const,
    gasUsed: BLOCKSCOUT_TX_V2_NATIVE.gas_used,
    explorerUrl: `https://etherscan.io/tx/${TX_HASH}`,
  },
  timestamp: BLOCKSCOUT_TX_V2_NATIVE.timestamp,
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
      "href": "https://etherscan.io/tx/0xbc78ab8a9e9a0bca7d0321a27b2c03addeae08ba81ea98b03cd3dd237eabed44",
      "badge": "13579024",
      "badgeVariant": "success"
    },
    {
      "id": "transaction.timestamp",
      "group": "default",
      "label": "Timestamp",
      "value": "2022-08-02T07:18:05.000000Z",
      "kind": "timestamp",
      "displayValue": "2022-08-02T07:18:05Z"
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
    },
    {
      "id": "transaction.value",
      "group": "default",
      "label": "Value",
      "value": "2875624785376768",
      "kind": "amount",
      "displayValue": "0.002875624785376768 ETH"
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

export const resolvedNativeTransferFixture: ReviewFixture = {
  name: "resolvedNativeTransfer",
  hash: TX_HASH,
  payload,
  output,
};
