import type { Abi } from "./types.ts";

const transferSelectorAbi = [
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
] as const;

/** Demo-only selector → ABI fragments (e.g. Etherscan-style lookup mock). */
export const DEMO_SELECTOR_ABI_MAP: Record<string, Abi> = {
  "0xa9059cbb": transferSelectorAbi as Abi,
};
