import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "../types.ts";
import { usdcPermitFixture } from "./usdc_permit.ts";

const OWNER = "0x974caa59e49682cda0ad2bbe82983419a2ecc400";

const payload = {
  signerAddress: OWNER as `0x${string}`,
};

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
      "value": "USD Coin",
      "kind": "text"
    },
    {
      "id": "domain.version",
      "group": "domain",
      "label": "Domain version",
      "value": "2",
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
      "value": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "kind": "address",
      "displayValue": "USDC (0xa0b8…6eb48)"
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
      "highlight": true,
      "description": "Owner must be an address you control (not spender or relayer)"
    },
    {
      "id": "message.spender",
      "group": "message",
      "label": "Spender",
      "value": "0x4a6c312ec70e8747a587ee860a0353cd42be0ae0",
      "kind": "address",
      "highlight": true,
      "description": "Spender can move your tokens on-chain within the allowance"
    },
    {
      "id": "message.value",
      "group": "message",
      "label": "Allowance",
      "value": "9420522466979",
      "kind": "amount",
      "displayValue": "9,420,522.466979 USDC",
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
      "value": "1780517526",
      "kind": "timestamp",
      "displayValue": "2026-06-03T20:12:06Z",
      "description": "Confirm deadline is acceptable and not already expired"
    },
    {
      "id": "signature.domainHash",
      "group": "signature",
      "label": "Domain hash",
      "value": "0x06c37168a7db5138defc7866392bb87a741f9b3d104deb5094588ce041cae335",
      "kind": "hash",
      "description": "Hash of the EIP-712 domain separator; binds this signature to a specific chain and contract"
    },
    {
      "id": "signature.structHash",
      "group": "signature",
      "label": "Struct hash",
      "value": "0x33d9ffb4d245f25e56ff09019a4261a3a75ef9838969fcc4848d86ae34c673eb",
      "kind": "hash",
      "description": "Hash of the typed message struct (primaryType and field values)"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0xe6410f9a0c14ed6005ef600c3268feb65bd11bdfc646565fe58b1abd74988698",
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

export const ownerMatchFixture: ReviewFixture = {
  name: "ownerMatch",
  input: usdcPermitFixture.input,
  payload,
  output,
};
