import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "../types.ts";

const input = JSON.stringify({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    PermitDetails: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "expiration", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    PermitSingle: [
      { name: "details", type: "PermitDetails" },
      { name: "spender", type: "address" },
      { name: "sigDeadline", type: "uint256" },
    ],
  },
  primaryType: "PermitSingle",
  domain: {
    name: "Permit2",
    chainId: 1,
    verifyingContract: "0x000000000022d473030f116ddee9fd6b43ac78b3",
  },
  message: {
    details: {
      token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      amount: "1000000",
      expiration: 1780517526,
      nonce: 0,
    },
    spender: "0x4a6c312ec70e8747a587ee860a0353cd42be0ae0",
    sigDeadline: 1780517526,
  },
});

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "typedData",
  "title": "EIP-712 Typed Data Signature",
  "summary": "Permit2 approval: verify token, spender, and allowance before signing",
  "checks": [
    {
      "id": "domain.name",
      "group": "domain",
      "label": "Domain name",
      "value": "Permit2",
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
      "value": "0x000000000022d473030f116ddee9fd6b43ac78b3",
      "kind": "address",
      "displayValue": "USDC (0x0000…c78b3)"
    },
    {
      "id": "message.primaryType",
      "group": "message",
      "label": "Primary type",
      "value": "PermitSingle",
      "kind": "text"
    },
    {
      "id": "message.details.token",
      "group": "message",
      "label": "Details Token",
      "value": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.details.amount",
      "group": "message",
      "label": "Allowance",
      "value": "1000000",
      "kind": "amount",
      "displayValue": "1.000000 USDC",
      "highlight": true
    },
    {
      "id": "message.details.expiration",
      "group": "message",
      "label": "Details Expiration",
      "value": "1780517526",
      "kind": "timestamp",
      "displayValue": "2026-06-03T20:12:06Z"
    },
    {
      "id": "message.details.nonce",
      "group": "message",
      "label": "Details Nonce",
      "value": "0",
      "kind": "text"
    },
    {
      "id": "message.spender",
      "group": "message",
      "label": "Spender",
      "value": "0x4a6c312ec70e8747a587ee860a0353cd42be0ae0",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.sigDeadline",
      "group": "message",
      "label": "Deadline",
      "value": "1780517526",
      "kind": "timestamp",
      "displayValue": "2026-06-03T20:12:06Z"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0x89c974e69462e12ee023c8c92cfdbb24dffc330db4ceafb66d608967315dd573",
      "kind": "hash"
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
      "message": "sigDeadline is more than one year in the future"
    }
  ],
  "facts": {
    "primaryType": "PermitSingle",
    "signableHash": "0x89c974e69462e12ee023c8c92cfdbb24dffc330db4ceafb66d608967315dd573",
    "scenarioId": "permit2",
    "tokenSymbol": "USDC",
    "tokenDecimals": 6
  }
} satisfies ReviewDocument;

export const permit2Fixture: ReviewFixture = {
  name: "permit2",
  input,
  output,
};
