import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "../types.ts";

const input = JSON.stringify({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    Login: [
      { name: "statement", type: "string" },
      { name: "uri", type: "string" },
      { name: "nonce", type: "string" },
      { name: "expirationTime", type: "uint256" },
    ],
  },
  primaryType: "Login",
  domain: { name: "Login", version: "1", chainId: 1 },
  message: {
    statement: "Sign in to Example App",
    uri: "https://example.com",
    nonce: "random-nonce-123",
    expirationTime: 1893456000,
  },
});

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "typedData",
  "title": "EIP-712 Typed Data Signature",
  "summary": "Sign-in message: verify domain, URI, nonce, and expiration (low asset risk)",
  "checks": [
    {
      "id": "domain.name",
      "group": "domain",
      "label": "Domain name",
      "value": "Login",
      "kind": "text",
      "highlight": true
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
      "value": "Login",
      "kind": "text"
    },
    {
      "id": "message.statement",
      "group": "message",
      "label": "Statement",
      "value": "Sign in to Example App",
      "kind": "text",
      "highlight": true
    },
    {
      "id": "message.uri",
      "group": "message",
      "label": "URI",
      "value": "https://example.com",
      "kind": "text",
      "highlight": true
    },
    {
      "id": "message.nonce",
      "group": "message",
      "label": "Nonce",
      "value": "random-nonce-123",
      "kind": "text",
      "highlight": true
    },
    {
      "id": "message.expirationTime",
      "group": "message",
      "label": "ExpirationTime",
      "value": "1893456000",
      "kind": "timestamp",
      "displayValue": "2030-01-01T00:00:00Z",
      "highlight": true
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0x644bb0f7a4d568e5eb7f0e7df511a2c68990497da6b4658a24cda6f66a122f94",
      "kind": "hash",
      "highlight": true
    },
    {
      "id": "guidance.domain",
      "group": "guidance",
      "label": "Domain",
      "value": "Confirm domain matches the application you intend to sign in to",
      "kind": "text"
    },
    {
      "id": "guidance.uri",
      "group": "guidance",
      "label": "URI",
      "value": "URI should match the site requesting the signature",
      "kind": "text"
    },
    {
      "id": "guidance.nonce",
      "group": "guidance",
      "label": "Nonce",
      "value": "Nonce prevents replay of this login signature",
      "kind": "text"
    },
    {
      "id": "guidance.reuse",
      "group": "guidance",
      "label": "Reuse risk",
      "value": "Login signatures should not be reusable as other protocol actions",
      "kind": "text"
    }
  ],
  "warnings": [],
  "facts": {
    "primaryType": "Login",
    "signableHash": "0x644bb0f7a4d568e5eb7f0e7df511a2c68990497da6b4658a24cda6f66a122f94",
    "scenarioId": "auth"
  }
} satisfies ReviewDocument;

export const siweFixture: ReviewFixture = {
  name: "siwe",
  input,
  output,
};
