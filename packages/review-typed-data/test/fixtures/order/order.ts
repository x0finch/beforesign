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
    OfferItem: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    Order: [
      { name: "offer", type: "OfferItem[]" },
      { name: "consideration", type: "OfferItem[]" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "salt", type: "uint256" },
    ],
  },
  primaryType: "Order",
  domain: {
    name: "Seaport",
    version: "1.5",
    chainId: 1,
    verifyingContract: "0x0000000000000077000000000000000000000000",
  },
  message: {
    offer: [
      {
        token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        amount: "1000000",
      },
    ],
    consideration: [
      {
        token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        amount: "500000000000000000",
      },
    ],
    startTime: 1700000000,
    endTime: 1800000000,
    salt: 42,
  },
});

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "typedData",
  "title": "EIP-712 Typed Data Signature",
  "summary": "Marketplace order: verify tokens offered, received, fees, and who can fill the order",
  "checks": [
    {
      "id": "domain.name",
      "group": "domain",
      "label": "Domain name",
      "value": "Seaport",
      "kind": "text"
    },
    {
      "id": "domain.version",
      "group": "domain",
      "label": "Domain version",
      "value": "1.5",
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
      "value": "0x0000000000000077000000000000000000000000",
      "kind": "address"
    },
    {
      "id": "message.primaryType",
      "group": "message",
      "label": "Primary type",
      "value": "Order",
      "kind": "text"
    },
    {
      "id": "message.offer.0.token",
      "group": "message",
      "label": "Offer 0 Token",
      "value": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.offer.0.amount",
      "group": "message",
      "label": "Offer 0 Amount",
      "value": "1000000",
      "kind": "amount",
      "highlight": true
    },
    {
      "id": "message.consideration.0.token",
      "group": "message",
      "label": "Consideration 0 Token",
      "value": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "kind": "address",
      "highlight": true
    },
    {
      "id": "message.consideration.0.amount",
      "group": "message",
      "label": "Consideration 0 Amount",
      "value": "500000000000000000",
      "kind": "amount",
      "highlight": true
    },
    {
      "id": "message.startTime",
      "group": "message",
      "label": "Start time",
      "value": "1700000000",
      "kind": "text"
    },
    {
      "id": "message.endTime",
      "group": "message",
      "label": "End time",
      "value": "1800000000",
      "kind": "text"
    },
    {
      "id": "message.salt",
      "group": "message",
      "label": "Salt",
      "value": "42",
      "kind": "text"
    },
    {
      "id": "signature.domainHash",
      "group": "signature",
      "label": "Domain hash",
      "value": "0xd38749c53eb6d85e1d776a3d0bac96aca981a18b5605c9f5d1b28e2b3a7bbdc1",
      "kind": "hash"
    },
    {
      "id": "signature.structHash",
      "group": "signature",
      "label": "Struct hash",
      "value": "0xc0b0bfe3627992c0ac2a273edd07018e18ee8dcd722db3e929538ac046084d0c",
      "kind": "hash"
    },
    {
      "id": "signature.signableHash",
      "group": "signature",
      "label": "Signable hash",
      "value": "0xd954185bc3c28c0691dce91cbc46618d6d8c2905bc6b9c99ff7a836b032fde06",
      "kind": "hash"
    },
    {
      "id": "guidance.tokens",
      "group": "guidance",
      "label": "Tokens",
      "value": "Review which tokens and amounts you give versus receive",
      "kind": "text"
    },
    {
      "id": "guidance.fees",
      "group": "guidance",
      "label": "Fees",
      "value": "Check fees, royalties, and extra consideration items",
      "kind": "text"
    },
    {
      "id": "guidance.filler",
      "group": "guidance",
      "label": "Filler",
      "value": "Confirm whether any address can fill this signed order",
      "kind": "text"
    }
  ],
  "warnings": [],
  "facts": {
    "primaryType": "Order",
    "domainHash": "0xd38749c53eb6d85e1d776a3d0bac96aca981a18b5605c9f5d1b28e2b3a7bbdc1",
    "structHash": "0xc0b0bfe3627992c0ac2a273edd07018e18ee8dcd722db3e929538ac046084d0c",
    "signableHash": "0xd954185bc3c28c0691dce91cbc46618d6d8c2905bc6b9c99ff7a836b032fde06",
    "scenarioId": "order"
  }
} satisfies ReviewDocument;

export const orderFixture: ReviewFixture = {
  name: "order",
  input,
  output,
};
