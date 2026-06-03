export { createBlockscoutClient, type BlockscoutClient } from "./blockscout.ts";
export { createEtherscanClient, type EtherscanClient } from "./etherscan.ts";
export { createDebankClient, type DebankClient } from "./debank.ts";
export { resolveChainId } from "./resolve_chain_id.ts";

import type { BlockscoutClient } from "./blockscout.ts";
import type { DebankClient } from "./debank.ts";
import type { EtherscanClient } from "./etherscan.ts";

export type ClientsBundle = {
  blockscout: BlockscoutClient;
  etherscan: EtherscanClient;
  debank: DebankClient;
};
