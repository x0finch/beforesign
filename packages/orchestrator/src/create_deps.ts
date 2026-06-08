import { createDebankClient, createEtherscanClient, createSignatureLookupClient, createTenderlyClient } from "@beforesign/clients";
import type { ParseInputDeps } from "./parse_input.ts";

export type ApiKeys = {
  etherscanApiKey: string;
  debankAccessKey: string;
  tenderlyAccessKey?: string;
};

export function createDepsFromKeys(keys: ApiKeys): ParseInputDeps {
  return {
    txLookup: createTenderlyClient({
      accessKey: keys.tenderlyAccessKey || undefined,
    }),
    etherscan: createEtherscanClient({
      apiKey: keys.etherscanApiKey || "missing",
    }),
    debank: createDebankClient({
      accessKey: keys.debankAccessKey || "missing",
    }),
    signatureLookup: createSignatureLookupClient(),
    txLookupEnabled: true,
    etherscanEnabled: Boolean(keys.etherscanApiKey),
    debankEnabled: Boolean(keys.debankAccessKey),
  };
}
