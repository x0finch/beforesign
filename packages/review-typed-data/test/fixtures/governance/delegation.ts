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
    Delegation: [
      { name: "delegator", type: "address" },
      { name: "delegatee", type: "address" },
      { name: "balance", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  },
  primaryType: "Delegation",
  domain: {
    name: "Governance",
    version: "1",
    chainId: 1,
    verifyingContract: "0x0000000000000000000000000000000000000001",
  },
  message: {
    delegator: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    delegatee: "0x0000000000000000000000000000000000000002",
    balance: "1000000000000000000",
    nonce: 0,
  },
});

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "typedData",
  "scenarioId": "governance",
  "title": "EIP-712 Typed Data Signature",
  "summary": "Governance signature (Delegation): verify delegatee and delegation scope",
  "checks": [
    {
      "id": "domain.name",
      "group": "domain",
      "label": "Domain name",
      "value": "Governance",
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
      "id": "domain.verifyingContract",
      "group": "domain",
      "label": "Verifying contract",
      "value": "0x0000000000000000000000000000000000000001",
      "kind": "address"
    },
    {
      "id": "message.primaryType",
      "group": "message",
      "label": "Primary type",
      "value": "Delegation",
      "kind": "text"
    },
    {
      "id": "message.delegator",
      "group": "message",
      "label": "Delegator",
      "value": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.delegatee",
      "group": "message",
      "label": "Delegatee",
      "value": "0x0000000000000000000000000000000000000002",
      "kind": "address",
      "highlight": true,
      "description": "Delegatee will act on your behalf within the signed scope. Confirm token amount, proposal ID, and whether delegation is permanent or one-time"
    },
    {
      "id": "message.balance",
      "group": "message",
      "label": "Balance",
      "value": "1000000000000000000",
      "kind": "text",
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
      "id": "signature.domainHash",
      "group": "signature",
      "label": "Domain hash",
      "value": "0x1dbeacf1a398f7f3c4db81eba05ca9b3b087ce2d23ad93d6355dc5352059150d",
      "kind": "hash",
      "description": "Hash of the EIP-712 domain separator; binds this signature to a specific chain and contract"
    },
    {
      "id": "signature.structHash",
      "group": "signature",
      "label": "Struct hash",
      "value": "0x10d9f135b5f1fea0f66fb347ec58de8313f7c95701bf5ff80b76b5b96a61c8cc",
      "kind": "hash",
      "description": "Hash of the typed message struct (primaryType and field values)"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0xa813fe76bd4ec8b2c395185590215bc3c8486bc35aef6805064d792e110cc64c",
      "kind": "hash",
      "description": "Final digest your wallet signs under EIP-712"
    }
  ],
  "warnings": [],
  "facts": {}
} satisfies ReviewDocument;

export const delegationFixture: ReviewFixture = {
  name: "delegation",
  input,
  output,
};
