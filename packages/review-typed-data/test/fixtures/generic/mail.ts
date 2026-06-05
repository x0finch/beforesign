import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "../types.ts";

const input = JSON.stringify({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    Mail: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "contents", type: "string" },
    ],
  },
  primaryType: "Mail",
  domain: { name: "Ether Mail", version: "1", chainId: 1 },
  message: {
    from: "0x0000000000000000000000000000000000000001",
    to: "0x0000000000000000000000000000000000000002",
    contents: "Hello",
  },
});

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "typedData",
  "title": "EIP-712 Typed Data Signature",
  "summary": "EIP-712 signature: verify Mail fields before signing",
  "checks": [
    {
      "id": "domain.name",
      "group": "domain",
      "label": "Domain name",
      "value": "Ether Mail",
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
      "id": "message.primaryType",
      "group": "message",
      "label": "Primary type",
      "value": "Mail",
      "kind": "text"
    },
    {
      "id": "message.from",
      "group": "message",
      "label": "From",
      "value": "0x0000000000000000000000000000000000000001",
      "kind": "address"
    },
    {
      "id": "message.to",
      "group": "message",
      "label": "To",
      "value": "0x0000000000000000000000000000000000000002",
      "kind": "address"
    },
    {
      "id": "message.contents",
      "group": "message",
      "label": "Contents",
      "value": "Hello",
      "kind": "text"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0xcda71b056b748d54b6eb3b3810356da66e9d1290aaa3eea1f3cf4ece610caa71",
      "kind": "hash",
      "highlight": true
    }
  ],
  "warnings": [],
  "facts": {
    "primaryType": "Mail",
    "signableHash": "0xcda71b056b748d54b6eb3b3810356da66e9d1290aaa3eea1f3cf4ece610caa71",
    "scenarioId": "generic"
  }
} satisfies ReviewDocument;

export const mailFixture: ReviewFixture = {
  name: "mail",
  input,
  output,
};
