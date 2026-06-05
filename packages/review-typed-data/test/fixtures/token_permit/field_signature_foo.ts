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
      "displayValue": "Ethereum (1)"
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
      "highlight": true,
      "description": "Owner must be an address you control (not spender or relayer)"
    },
    {
      "id": "message.spender",
      "group": "message",
      "label": "Spender",
      "value": "0x0000000000000000000000000000000000000002",
      "kind": "address",
      "highlight": true,
      "description": "Spender can move your tokens on-chain within the allowance"
    },
    {
      "id": "message.value",
      "group": "message",
      "label": "Allowance",
      "value": "100",
      "kind": "amount",
      "highlight": true,
      "description": "Unlimited allowance equals on-chain approve(max)"
    },
    {
      "id": "signature.domainHash",
      "group": "signature",
      "label": "Domain hash",
      "value": "0x330296c1ee57897aba3923af747e365907189fcd0bf5fedf7087fa9dd9d1d2db",
      "kind": "hash"
    },
    {
      "id": "signature.structHash",
      "group": "signature",
      "label": "Struct hash",
      "value": "0x6dca1602082d3b3b8ccebbae89aa4243a721a855419b1bbd9744d15f5b3eb269",
      "kind": "hash"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0x9d9837da6254d7c2a25b3db32a46a1ce817d4a495f3e498529bbf1bdf4cc1082",
      "kind": "hash"
    }
  ],
  "warnings": [],
  "facts": {
    "primaryType": "Foo",
    "domainHash": "0x330296c1ee57897aba3923af747e365907189fcd0bf5fedf7087fa9dd9d1d2db",
    "structHash": "0x6dca1602082d3b3b8ccebbae89aa4243a721a855419b1bbd9744d15f5b3eb269",
    "signableHash": "0x9d9837da6254d7c2a25b3db32a46a1ce817d4a495f3e498529bbf1bdf4cc1082",
    "scenarioId": "tokenPermit"
  }
} satisfies ReviewDocument;

export const fieldSignatureFooFixture: ReviewFixture = {
  name: "fieldSignatureFoo",
  input,
  output,
};
