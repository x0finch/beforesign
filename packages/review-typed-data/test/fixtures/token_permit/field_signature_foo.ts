import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "../types.ts";

const OWNER = "0x974caa59e49682cda0ad2bbe82983419a2ecc400";

const input = JSON.stringify({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    Foo: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
  },
  primaryType: "Foo",
  domain: { name: "Test", chainId: 1 },
  message: {
    owner: OWNER,
    spender: "0x0000000000000000000000000000000000000002",
    value: "100",
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
      "id": "domain.chainId",
      "group": "domain",
      "label": "Chain ID",
      "value": "1",
      "kind": "chainId",
      "displayValue": "Ethereum (1)",
      "highlight": true
    },
    {
      "id": "message.primaryType",
      "group": "message",
      "label": "Primary type",
      "value": "Foo",
      "kind": "text"
    },
    {
      "id": "message.owner",
      "group": "message",
      "label": "Owner",
      "value": "0x974caa59e49682cda0ad2bbe82983419a2ecc400",
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
      "value": "100",
      "kind": "amount",
      "highlight": true
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0x9d9837da6254d7c2a25b3db32a46a1ce817d4a495f3e498529bbf1bdf4cc1082",
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
  "warnings": [],
  "facts": {
    "primaryType": "Foo",
    "signableHash": "0x9d9837da6254d7c2a25b3db32a46a1ce817d4a495f3e498529bbf1bdf4cc1082",
    "scenarioId": "tokenPermit"
  }
} satisfies ReviewDocument;

export const fieldSignatureFooFixture: ReviewFixture = {
  name: "fieldSignatureFoo",
  input,
  output,
};
