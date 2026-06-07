import type { Abi } from "../types.ts";

export const TOKEN_A = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as const;
export const TOKEN_B = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" as const;

export const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

export const forwardBytesAbi = [
  {
    type: "function",
    name: "forward",
    inputs: [{ name: "data", type: "bytes" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const erc20TransferAbiMap = {
  [TOKEN_A.toLowerCase()]: erc20TransferAbi as Abi,
  [TOKEN_B.toLowerCase()]: erc20TransferAbi as Abi,
};
