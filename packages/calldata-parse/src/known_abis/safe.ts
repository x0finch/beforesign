import type { Abi } from "viem";

export const safeAbi = [
  {
    type: "function",
    name: "execTransaction",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "operation", type: "uint8" },
      { name: "safeTxGas", type: "uint256" },
      { name: "baseGas", type: "uint256" },
      { name: "gasPrice", type: "uint256" },
      { name: "gasToken", type: "address" },
      { name: "refundReceiver", type: "address" },
      { name: "signatures", type: "bytes" },
    ],
    outputs: [{ name: "success", type: "bool" }],
    stateMutability: "payable",
  },
  // Packed `transactions` bytes: see MultiSend.sol
  // https://github.com/safe-fndn/safe-smart-account/blob/main/contracts/libraries/MultiSend.sol
  {
    type: "function",
    name: "multiSend",
    inputs: [{ name: "transactions", type: "bytes" }],
    outputs: [],
    stateMutability: "payable",
  },
] as const satisfies Abi;

export const safeKnownAbi = safeAbi as Abi;
