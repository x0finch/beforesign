export { create_blockscout_client, type blockscout_client } from "./blockscout.ts";
export { create_etherscan_client, type etherscan_client } from "./etherscan.ts";
export { create_debank_client, type debank_client } from "./debank.ts";
export { resolve_chain_id } from "./resolve_chain_id.ts";

import type { blockscout_client } from "./blockscout.ts";
import type { debank_client } from "./debank.ts";
import type { etherscan_client } from "./etherscan.ts";

export type clients_bundle = {
  blockscout: blockscout_client;
  etherscan: etherscan_client;
  debank: debank_client;
};
