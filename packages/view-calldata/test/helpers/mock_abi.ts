import type { Abi } from "viem";

export const TRANSFER_SELECTOR_ABI = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "recipient", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
] as const satisfies Abi;

export const APPROVE_SELECTOR_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
] as const satisfies Abi;

export const MOCK_SELECTOR_ABI: Record<string, Abi> = {
  "0xa9059cbb": TRANSFER_SELECTOR_ABI as Abi,
  "0x095ea7b3": APPROVE_SELECTOR_ABI as Abi,
};
