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
  "scenarioId": "generic",
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
      "displayValue": "Ethereum (1)"
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
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.to",
      "group": "message",
      "label": "To",
      "value": "0x0000000000000000000000000000000000000002",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.contents",
      "group": "message",
      "label": "Contents",
      "value": "Hello",
      "kind": "text",
      "highlight": true
    },
    {
      "id": "signature.domainHash",
      "group": "signature",
      "label": "Domain hash",
      "value": "0x3b98b16ad068d9d8854a6a416bd476de44a4933ec5104d7c786a422ab262ed14",
      "kind": "hash",
      "description": "Hash of the EIP-712 domain separator; binds this signature to a specific chain and contract"
    },
    {
      "id": "signature.structHash",
      "group": "signature",
      "label": "Struct hash",
      "value": "0xb00fd1b60681faf3e7d86b1aff876137b72c20b4acf02ecdc72f9c44edda838a",
      "kind": "hash",
      "description": "Hash of the typed message struct (primaryType and field values)"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0xcda71b056b748d54b6eb3b3810356da66e9d1290aaa3eea1f3cf4ece610caa71",
      "kind": "hash",
      "description": "Final digest your wallet signs under EIP-712"
    }
  ],
  "warnings": [],
  "facts": {}
} satisfies ReviewDocument;

export const mailFixture: ReviewFixture = {
  name: "mail",
  input,
  output,
};
