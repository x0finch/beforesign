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

export const REDEEM_SELECTOR_ABI = [
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "", type: "uint8" },
      { name: "", type: "uint16" },
      { name: "", type: "uint64" },
      { name: "", type: "uint128" },
      { name: "", type: "bytes32[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const satisfies Abi;

export const CLAIM_VESTED_SELECTOR_ABI = [
  {
    type: "function",
    name: "claimVestedTokensViaModule",
    inputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "address" },
      { name: "", type: "uint128" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const satisfies Abi;

export const MOCK_SELECTOR_ABI: Record<string, Abi> = {
  "0xa9059cbb": TRANSFER_SELECTOR_ABI as Abi,
  "0x095ea7b3": APPROVE_SELECTOR_ABI as Abi,
  "0xbf6213e4": REDEEM_SELECTOR_ABI as Abi,
  "0x0087b83f": CLAIM_VESTED_SELECTOR_ABI as Abi,
};
