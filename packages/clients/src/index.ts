export { createTenderlyClient, type TenderlyClient } from "./tenderly.ts";
export { createEtherscanClient, type EtherscanClient } from "./etherscan.ts";
export { createDebankClient, type DebankClient } from "./debank.ts";
export { createSignatureLookupClient, pickFourByteSignature, type SignatureLookupClient } from "./signature_lookup.ts";
export { resolveChainId } from "./resolve_chain_id.ts";
export type { TxLookupClient, TxLookupDetail } from "./tx_lookup.ts";

import type { DebankClient } from "./debank.ts";
import type { EtherscanClient } from "./etherscan.ts";
import type { SignatureLookupClient } from "./signature_lookup.ts";
import type { TxLookupClient } from "./tx_lookup.ts";

export type ClientsBundle = {
  txLookup: TxLookupClient;
  etherscan: EtherscanClient;
  debank: DebankClient;
  signatureLookup: SignatureLookupClient;
};
