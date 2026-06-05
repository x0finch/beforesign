export type InputKind =
  | "txHash"
  | "signedTx"
  | "unsignedTx"
  | "calldata"
  | "typedData"
  | "unknown";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type WarningSeverity = "info" | "warning" | "destructive";

export type WarningItem = {
  code: string;
  severity: WarningSeverity;
  message: string;
  messageEn?: string;
};

export type DiscoveryStatus = "resolved" | "notFound" | "ambiguous" | "pending";

export type DiscoveryHit = {
  id: string;
  chainId: number;
  chainName: string;
  blockNumber?: number;
  from?: string;
  to?: string;
  timestamp?: string;
};

export type DiscoveryResult = {
  status: DiscoveryStatus;
  hits: DiscoveryHit[];
  resolvedChainId?: number;
};

export type NormalizedTx = {
  chainId?: number;
  from?: string;
  to?: string;
  value?: string;
  data?: string;
  nonce?: number;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasPrice?: string;
  type?: number;
  hash?: string;
  signedHex?: string;
  v?: string;
  r?: string;
  s?: string;
};

export type CalldataDecode = {
  selector: string;
  functionName?: string;
  args: Array<{ name: string; type: string; value: string }>;
  raw: string;
  summary?: string;
};

export type TypedDataView = {
  domain: { [key: string]: JsonValue };
  primaryType: string;
  message: { [key: string]: JsonValue };
  signableHash?: string;
  summary?: string;
};

export type OnchainTxMeta = {
  chainId: number;
  blockNumber?: string;
  status: "success" | "fail" | "pending";
  gasUsed?: string;
  explorerUrl?: string;
};

export type DebankSimulation = {
  success: boolean;
  error?: string;
  gasUsed?: string;
  balanceChanges?: unknown[];
};

export type ParseResult = {
  kind: InputKind;
  summary: string;
  summaryEn?: string;
  warnings: WarningItem[];
  raw: JsonValue;
  tx?: NormalizedTx;
  calldata?: CalldataDecode;
  typedData?: TypedDataView;
  simulation?: DebankSimulation;
  explanation?: string;
  explanationEn?: string;
  onchain?: OnchainTxMeta;
  discovery?: DiscoveryResult;
  missingFields?: string[];
};

export type ReviewCheckKind =
  | "address"
  | "hash"
  | "amount"
  | "selector"
  | "text"
  | "timestamp"
  | "chainId"
  | "bool";

export type ReviewCheckItem = {
  id: string;
  group: string;
  label: string;
  value: string;
  displayValue?: string;
  kind: ReviewCheckKind;
  highlight?: boolean;
  risk?: WarningSeverity;
};

export type ReviewDocument = {
  kind: InputKind;
  title: string;
  summary: string;
  checks: ReviewCheckItem[];
  warnings: WarningItem[];
  facts?: Record<string, JsonValue>;
};
