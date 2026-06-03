export type input_kind =
  | "tx_hash"
  | "signed_tx"
  | "unsigned_tx"
  | "calldata"
  | "typed_data"
  | "unknown";

export type json_value =
  | string
  | number
  | boolean
  | null
  | json_value[]
  | { [key: string]: json_value };

export type warning_severity = "info" | "warning" | "destructive";

export type warning_item = {
  code: string;
  severity: warning_severity;
  message: string;
  message_en?: string;
};

export type discovery_status = "resolved" | "not_found" | "ambiguous" | "pending";

export type discovery_hit = {
  id: string;
  chain_id: number;
  chain_name: string;
  block_number?: number;
  from?: string;
  to?: string;
  timestamp?: string;
};

export type discovery_result = {
  status: discovery_status;
  hits: discovery_hit[];
  resolved_chain_id?: number;
};

export type normalized_tx = {
  chain_id?: number;
  from?: string;
  to?: string;
  value?: string;
  data?: string;
  nonce?: number;
  gas_limit?: string;
  max_fee_per_gas?: string;
  max_priority_fee_per_gas?: string;
  gas_price?: string;
  type?: number;
  hash?: string;
  signed_hex?: string;
  v?: string;
  r?: string;
  s?: string;
};

export type calldata_decode = {
  selector: string;
  function_name?: string;
  args: Array<{ name: string; type: string; value: string }>;
  raw: string;
  summary?: string;
};

export type typed_data_view = {
  domain: { [key: string]: json_value };
  primary_type: string;
  message: { [key: string]: json_value };
  signable_hash?: string;
  summary?: string;
};

export type onchain_tx_meta = {
  chain_id: number;
  block_number?: string;
  status: "success" | "fail" | "pending";
  gas_used?: string;
  explorer_url?: string;
};

export type debank_simulation = {
  success: boolean;
  error?: string;
  gas_used?: string;
  balance_changes?: unknown[];
};

export type parse_result = {
  kind: input_kind;
  summary: string;
  summary_en?: string;
  warnings: warning_item[];
  raw: json_value;
  tx?: normalized_tx;
  calldata?: calldata_decode;
  typed_data?: typed_data_view;
  simulation?: debank_simulation;
  explanation?: string;
  explanation_en?: string;
  onchain?: onchain_tx_meta;
  discovery?: discovery_result;
  missing_fields?: string[];
};
