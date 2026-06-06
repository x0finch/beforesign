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
  "scenarioId": "tokenPermit",
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
      "displayValue": "Ethereum (1)"
    },
    {
      "id": "domain.verifyingContract",
      "group": "domain",
      "label": "Verifying contract",
      "value": "0x0000000000000000000000000000000000000001",
      "kind": "address",
      "displayValue": "USDC (0x0000…00001)"
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
      "value": "1000000000000000000",
      "kind": "amount",
      "displayValue": "1,000,000,000,000.000000 USDC",
      "highlight": true,
      "description": "Unlimited allowance equals on-chain approve(max)"
    },
    {
      "id": "message.nonce",
      "group": "message",
      "label": "Nonce",
      "value": "0",
      "kind": "text",
      "description": "Nonce prevents replay; should align with on-chain state"
    },
    {
      "id": "message.deadline",
      "group": "message",
      "label": "Deadline",
      "value": "9999999999",
      "kind": "timestamp",
      "displayValue": "2286-11-20T17:46:39Z",
      "description": "Confirm deadline is acceptable and not already expired"
    },
    {
      "id": "signature.domainHash",
      "group": "signature",
      "label": "Domain hash",
      "value": "0xdfac19a4f73b6819b0d2104acfec9b4284f9eeed962895a40047c774703906cc",
      "kind": "hash",
      "description": "Hash of the EIP-712 domain separator; binds this signature to a specific chain and contract"
    },
    {
      "id": "signature.structHash",
      "group": "signature",
      "label": "Struct hash",
      "value": "0xfd5950b4b4ff6d99d9c12674eecf86ee78eb1c9d742f1139991e0885f5138a16",
      "kind": "hash",
      "description": "Hash of the typed message struct (primaryType and field values)"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0x2a0809284be1f9c2ce01fda73a7fd98bce58142d28ff7f56de7dcd3a2b3b3924",
      "kind": "hash",
      "description": "Final digest your wallet signs under EIP-712"
    }
  ],
  "warnings": [
    {
      "code": "longDeadline",
      "severity": "warning",
      "message": "deadline is more than one year in the future"
    }
  ],
  "facts": {
    "tokenSymbol": "USDC",
    "tokenDecimals": 6
  }
} satisfies ReviewDocument;

export const typedDataIntegrationFixture: ReviewFixture = {
  name: "typedDataIntegration",
  input,
  output,
};
