import { TX_HASH } from "@beforesign/test-fixtures";
import type { ReviewDocument } from "@beforesign/core";
import type { ReviewFixture } from "./types.ts";

const payload = {
  discovery: {
    status: "ambiguous" as const,
    hits: [
      {
        id: `1-${TX_HASH}`,
        chainId: 1,
        chainName: "Ethereum",
        from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
        to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      },
      {
        id: `8453-${TX_HASH}`,
        chainId: 8453,
        chainName: "Base",
        from: "0x00192fb10df37c9fb26829eb2cc623cd1bf599e8",
        to: "0xc67f4e626ee4d3f272c2fb31bad60761ab55ed9f",
      },
    ],
  },
};

// @generated output — fixtures:update 维护，勿手改
const output = {
  "kind": "txHash",
  "title": "Transaction",
  "summary": "Transaction hash: multiple chains matched; select the correct chain",
  "checks": [],
  "warnings": []
} satisfies ReviewDocument;

export const ambiguousFixture: ReviewFixture = {
  name: "ambiguous",
  hash: TX_HASH,
  payload,
  output,
};
