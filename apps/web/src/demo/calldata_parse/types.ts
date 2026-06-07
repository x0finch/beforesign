import type { ParseCalldataOptions } from "@beforesign/calldata-parse";

export type Abi = NonNullable<ParseCalldataOptions["abi"]>;

export type ParseOptionsInput = {
  abi?: Abi;
  maxDepth?: number;
  rootTarget?: `0x${string}`;
  abiByTarget?: Record<string, Abi>;
};

export type DemoParseCase = {
  name: string;
  input: `0x${string}`;
  options?: ParseOptionsInput;
};
