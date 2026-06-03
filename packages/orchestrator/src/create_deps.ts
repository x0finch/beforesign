import {
  create_blockscout_client,
  create_debank_client,
  create_etherscan_client,
} from "@beforesign/clients";
import type { parse_input_deps } from "./parse_input.ts";

export type api_keys = {
  etherscan_api_key: string;
  debank_access_key: string;
  blockscout_api_key: string;
};

export function create_deps_from_keys(keys: api_keys): parse_input_deps {
  return {
    blockscout: create_blockscout_client({
      api_key: keys.blockscout_api_key || "missing",
    }),
    etherscan: create_etherscan_client({
      api_key: keys.etherscan_api_key || "missing",
    }),
    debank: create_debank_client({
      access_key: keys.debank_access_key || "missing",
    }),
    blockscout_enabled: Boolean(keys.blockscout_api_key),
    etherscan_enabled: Boolean(keys.etherscan_api_key),
    debank_enabled: Boolean(keys.debank_access_key),
  };
}
