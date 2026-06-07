import type { Abi, Address, Hex } from "viem";
import type { SerializableCalldataCall } from "../../src/types.ts";

export type ParseFixture = {
  name: string;
  input: Hex;
  options?: {
    abi?: Abi;
    maxDepth?: number;
    rootTarget?: Address;
    abiByTarget?: Record<string, Abi>;
  };
  output: SerializableCalldataCall;
};
