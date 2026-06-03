import type { parse_input, parse_result } from "@beforesign/core";
import { serialize_parse_result } from "@beforesign/core";
import type { clients_bundle } from "@beforesign/clients";
import { resolve_chain_id } from "@beforesign/clients";
import { detect_input_type } from "@beforesign/detect";
import { can_simulate_debank, parse_locally } from "@beforesign/parse";
import { run_risk_rules } from "@beforesign/risk";
import { parse_calldata } from "@beforesign/parse";

export type parse_input_deps = clients_bundle & {
  blockscout_enabled?: boolean;
  etherscan_enabled?: boolean;
  debank_enabled?: boolean;
};

export async function parse_input(
  input: parse_input,
  deps: parse_input_deps,
): Promise<parse_result> {
  const { kind } = detect_input_type(input.raw);
  let result = parse_locally(kind, input.raw, {
    abi: input.abi,
  });

  const api_errors: string[] = [];

  if (kind === "tx_hash" && deps.blockscout_enabled !== false) {
    try {
      const discovery = await deps.blockscout.search_quick(input.raw.trim());
      result.discovery = discovery;
      const chain_id = resolve_chain_id(
        discovery,
        input.chain_id,
        input.selected_discovery_hit,
      );

      if (chain_id && deps.etherscan_enabled !== false) {
        try {
          const { tx, onchain } = await deps.etherscan.get_transaction(
            chain_id,
            input.raw.trim(),
          );
          result.tx = tx;
          result.onchain = onchain;
          result.kind = "signed_tx";
          if (tx.data) {
            let parsed_abi;
            try {
              parsed_abi = input.abi ? JSON.parse(input.abi) : undefined;
            } catch {
              parsed_abi = undefined;
            }
            result.calldata = parse_calldata(tx.data, {
              abi: parsed_abi,
              contract_address: tx.to,
            });
          }
          result.summary = "已上链交易";
          result.summary_en = "On-chain transaction";
        } catch (e) {
          api_errors.push(`Etherscan: ${e instanceof Error ? e.message : "failed"}`);
        }
      } else if (!chain_id) {
        result.summary = "请选择链或匹配结果";
        result.summary_en = "Select chain or pick a discovery match";
      }
    } catch (e) {
      api_errors.push(`Blockscout: ${e instanceof Error ? e.message : "failed"}`);
      if (input.chain_id && deps.etherscan_enabled !== false) {
        try {
          const { tx, onchain } = await deps.etherscan.get_transaction(
            input.chain_id,
            input.raw.trim(),
          );
          result.tx = tx;
          result.onchain = onchain;
          result.kind = "signed_tx";
          result.summary = "已上链交易";
          result.summary_en = "On-chain transaction";
        } catch (err) {
          api_errors.push(`Etherscan: ${err instanceof Error ? err.message : "failed"}`);
        }
      }
    }
  }

  if (kind === "unsigned_tx" && can_simulate_debank(result.tx) && deps.debank_enabled !== false) {
    try {
      result.simulation = await deps.debank.pre_exec_tx(result.tx!);
      const explanation = await deps.debank.explain_tx(result.tx!);
      if (explanation) {
        result.explanation = explanation;
        result.summary = explanation;
      }
    } catch (e) {
      api_errors.push(`DeBank: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  const risk_warnings = run_risk_rules(result, {
    selected_chain_id: input.chain_id,
  });
  result.warnings = [...result.warnings, ...risk_warnings];

  if (api_errors.length > 0) {
    for (const msg of api_errors) {
      result.warnings.push({
        code: "api_error",
        severity: "warning",
        message: msg,
        message_en: msg,
      });
    }
  }

  return serialize_parse_result(result);
}
