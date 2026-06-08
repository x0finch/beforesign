import type { ClientsBundle } from "@beforesign/clients";
import type { ViewResult } from "@beforesign/core";
import type { TypedDataDefinition } from "viem";
import { buildContext } from "./build_context.ts";
import { buildTypedDataSpec } from "./build_typed_data_spec.ts";
import { defaultRegistry } from "./profiles/profile_registry.ts";

export type TypedDataViewInput = {
  normalized: TypedDataDefinition;
  signerAddress?: `0x${string}`;
};

export async function buildTypedDataView(
  input: TypedDataViewInput,
  clients: ClientsBundle,
): Promise<ViewResult> {
  const ctx = buildContext(input.normalized, {
    signerAddress: input.signerAddress,
  });
  const profile = defaultRegistry.resolve(ctx);
  const preparedCtx = await profile.prepareContext(ctx, clients);
  return buildTypedDataSpec(preparedCtx);
}
