import type { Abi, Address, Hex } from "viem";

export type CalldataArgComponent = {
  name: string;
  type: string;
  components?: CalldataArgComponent[];
};

export type CalldataArg = {
  name: string;
  type: string;
  value: unknown;
  displayValue: string;
  components?: CalldataArgComponent[];
};

export type CalldataOutput = {
  name: string;
  type: string;
  components?: CalldataArgComponent[];
};

/** Index path into parent.args, e.g. "0/0/2" or "2". See resolveSourcePath. */
export type CalldataWrapperMeta = {
  kind: string;
  index?: number;
  sourcePath?: string;
};

export type CalldataCall = {
  raw: Hex;
  selector: Hex;
  depth: number;
  functionName?: string;
  signature?: string;
  signatureWithNames?: string;
  target?: Address;
  value?: bigint;
  operation?: "call" | "delegatecall";
  args: CalldataArg[];
  outputs?: CalldataOutput[];
  summary: string;
  wrapper?: CalldataWrapperMeta;
  children: CalldataCall[];
};

export type ResolveAbiContext = {
  selector: Hex;
  target?: Address;
  depth: number;
};

export type ResolveAbi = (ctx: ResolveAbiContext) => Promise<Abi | undefined>;

export type UnwrapPayload = {
  data: Hex;
  target?: Address;
  value?: bigint;
  operation?: "call" | "delegatecall";
  wrapper: CalldataWrapperMeta;
};

export type UnwrapContext = {
  selector: Hex;
  functionName?: string;
  args: readonly unknown[];
  decodedInputs?: readonly { name: string; type: string }[];
};

export interface CalldataUnwrapper {
  id: string;
  priority: number;
  match(ctx: { selector: Hex; functionName?: string }): boolean;
  unwrap(ctx: UnwrapContext): UnwrapPayload[];
}

export type ParseCalldataOptions = {
  abi?: Abi;
  maxDepth?: number;
  unwrappers?: CalldataUnwrapper[];
  resolveAbi?: ResolveAbi;
};

export type ParseSession = {
  seen: Set<Hex>;
  abiCache: Map<string, Abi | undefined>;
};

export type SerializableCalldataArg = Omit<CalldataArg, "value"> & {
  value?: unknown;
};

export type SerializableCalldataCall = Omit<CalldataCall, "value" | "args" | "children"> & {
  value?: string;
  args: SerializableCalldataArg[];
  children: SerializableCalldataCall[];
};
