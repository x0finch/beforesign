import type { ReviewDocument } from "@beforesign/core";

export const usdcPermitOutput = {
  kind: "typedData",
  title: "EIP-712 Typed Data Signature",
  summary: "Token permit: verify owner, spender, and allowance before signing",
  checks: [
    {
      id: "domain.chainId",
      group: "domain",
      label: "Chain ID",
      value: "1",
      kind: "chainId",
      displayValue: "Ethereum (1)",
    },
    {
      id: "message.owner",
      group: "message",
      label: "Owner",
      value: "0x974caa59e49682cda0ad2bbe82983419a2ecc400",
      kind: "address",
      description: "Owner must be an address you control (not spender or relayer)",
      highlight: true,
    },
    {
      id: "message.spender",
      group: "message",
      label: "Spender",
      value: "0x4a6c312ec70e8747a587ee860a0353cd42be0ae0",
      kind: "address",
      highlight: true,
    },
    {
      id: "message.value",
      group: "message",
      label: "Allowance",
      value: "9420522466979",
      kind: "amount",
      displayValue: "9,420,522.466979 USDC",
      highlight: true,
    },
  ],
  warnings: [
    {
      code: "longDeadline",
      severity: "warning",
      message: "deadline is more than one year in the future",
    },
  ],
  facts: {
    tokenSymbol: "USDC",
    tokenDecimals: 6,
  },
  scenarioId: "tokenPermit",
} satisfies ReviewDocument;
