import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "../types.ts";

const input = JSON.stringify({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  },
  primaryType: "Permit",
  domain: {
    name: "Test",
    version: "1",
    chainId: 1,
    verifyingContract: "0x0000000000000000000000000000000000000001",
  },
  message: {
    owner: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    spender: "0x0000000000000000000000000000000000000002",
    value: "1000000000000000000",
    nonce: 0,
    deadline: 9999999999,
  },
});

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "typedData",
  "title": "EIP-712 Typed Data Signature",
  "summary": "Token permit: verify owner, spender, and allowance before signing",
  "checks": [
    {
      "id": "domain.name",
      "group": "domain",
      "label": "Domain name",
      "value": "Test",
      "kind": "text"
    },
    {
      "id": "domain.version",
      "group": "domain",
      "label": "Domain version",
      "value": "1",
      "kind": "text"
    },
    {
      "id": "domain.chainId",
      "group": "domain",
      "label": "Chain ID",
      "value": "1",
      "kind": "chainId",
      "displayValue": "Ethereum (1)",
      "highlight": true
    },
    {
      "id": "domain.verifyingContract",
      "group": "domain",
      "label": "Verifying contract",
      "value": "0x0000000000000000000000000000000000000001",
      "kind": "address",
      "displayValue": "USDC (0x0000…00001)",
      "highlight": true
    },
    {
      "id": "message.primaryType",
      "group": "message",
      "label": "Primary type",
      "value": "Permit",
      "kind": "text"
    },
    {
      "id": "message.owner",
      "group": "message",
      "label": "Owner",
      "value": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.spender",
      "group": "message",
      "label": "Spender",
      "value": "0x0000000000000000000000000000000000000002",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.value",
      "group": "message",
      "label": "Value",
      "value": "1000000000000000000",
      "kind": "amount",
      "displayValue": "1,000,000,000,000.000000 USDC",
      "highlight": true
    },
    {
      "id": "message.nonce",
      "group": "message",
      "label": "Nonce",
      "value": "0",
      "kind": "text"
    },
    {
      "id": "message.deadline",
      "group": "message",
      "label": "Deadline",
      "value": "9999999999",
      "kind": "timestamp",
      "displayValue": "2286-11-20T17:46:39Z",
      "highlight": true
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0x2a0809284be1f9c2ce01fda73a7fd98bce58142d28ff7f56de7dcd3a2b3b3924",
      "kind": "hash",
      "highlight": true
    },
    {
      "id": "guidance.owner",
      "group": "guidance",
      "label": "Owner",
      "value": "Owner must be an address you control (not spender or relayer)",
      "kind": "text"
    },
    {
      "id": "guidance.spender",
      "group": "guidance",
      "label": "Spender",
      "value": "Spender can move your tokens on-chain within the allowance",
      "kind": "text"
    },
    {
      "id": "guidance.value",
      "group": "guidance",
      "label": "Allowance",
      "value": "Unlimited allowance equals on-chain approve(max)",
      "kind": "text"
    },
    {
      "id": "guidance.deadline",
      "group": "guidance",
      "label": "Deadline",
      "value": "Confirm deadline is acceptable and not already expired",
      "kind": "text"
    },
    {
      "id": "guidance.nonce",
      "group": "guidance",
      "label": "Nonce",
      "value": "Nonce prevents replay; should align with on-chain state",
      "kind": "text"
    }
  ],
  "warnings": [
    {
      "code": "longDeadline",
      "severity": "warning",
      "message": "deadline is more than one year in the future",
      "messageEn": "deadline is more than one year in the future"
    }
  ],
  "facts": {
    "primaryType": "Permit",
    "signableHash": "0x2a0809284be1f9c2ce01fda73a7fd98bce58142d28ff7f56de7dcd3a2b3b3924",
    "scenarioId": "tokenPermit",
    "tokenSymbol": "USDC",
    "tokenDecimals": 6
  }
} satisfies ReviewDocument;

export const typedDataIntegrationFixture: ReviewFixture = {
  name: "typedDataIntegration",
  input,
  output,
};
