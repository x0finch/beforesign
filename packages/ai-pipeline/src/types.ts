import type { ClientsBundle } from "@beforesign/clients";

export type AiPipelineDeps = ClientsBundle & {
  txLookupEnabled?: boolean;
  etherscanEnabled?: boolean;
  debankEnabled?: boolean;
};
