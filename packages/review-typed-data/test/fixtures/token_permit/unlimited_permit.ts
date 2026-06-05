import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "../types.ts";

const OWNER = "0x974caa59e49682cda0ad2bbe82983419a2ecc400";

const input = JSON.stringify({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "chainId", type: "uint256" },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
  },
  primaryType: "Permit",
  domain: { name: "Test", chainId: 1 },
  message: {
    owner: OWNER,
    spender: "0x0000000000000000000000000000000000000002",
    value:
      "115792089237316195423570985008687907853269984665640564039457584007913129639935",
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
      "value": "Permit",
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
      "label": "Allowance",
      "value": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "kind": "amount",
      "highlight": true,
      "risk": "destructive"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0x7aa66d86c7658cc96cd86f8e2550b33ebc4b4ad2e499442da7b109db876e0ad9",
      "kind": "hash"
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
    "primaryType": "Permit",
    "signableHash": "0x7aa66d86c7658cc96cd86f8e2550b33ebc4b4ad2e499442da7b109db876e0ad9",
    "scenarioId": "tokenPermit"
  }
} satisfies ReviewDocument;

export const unlimitedPermitFixture: ReviewFixture = {
  name: "unlimitedPermit",
  input,
  output,
};
