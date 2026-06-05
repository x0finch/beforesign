import type { ClientsBundle } from "@beforesign/clients";
import { domainChainId, fetchTokenHint } from "../token_hints.ts";
import type { TypedDataContext } from "./context.ts";
import { TokenApprovalProfile } from "./token_approval_profile.ts";

const PERMIT2_PRIMARY_TYPES = new Set([
  "PermitSingle",
  "PermitBatch",
  "PermitTransferFrom",
  "PermitDetails",
]);

export class Permit2Profile extends TokenApprovalProfile {
  readonly id = "permit2" as const;
  readonly priority = 80;

  match(ctx: TypedDataContext): boolean {
    if (PERMIT2_PRIMARY_TYPES.has(ctx.normalized.primaryType)) return true;
    const domainName = this.getDomainString(ctx, "name");
    if (domainName?.toLowerCase().includes("permit2")) return true;
    return false;
  }

  summary(ctx: TypedDataContext): string {
    void ctx;
    return "Permit2 approval: verify token, spender, and allowance before signing";
  }

  async prepareContext(
    ctx: TypedDataContext,
    clients: ClientsBundle,
  ): Promise<TypedDataContext> {
    const prepared = await super.prepareContext(ctx, clients);
    const details = prepared.message.details;
    const tokenAddress =
      typeof details === "object" &&
      details !== null &&
      "token" in details &&
      typeof details.token === "string"
        ? details.token
        : undefined;
    if (!tokenAddress) return prepared;

    const hint = await fetchTokenHint(
      domainChainId(prepared.domain),
      tokenAddress,
      clients.etherscan,
    );
    if (!hint) return prepared;

    return {
      ...prepared,
      tokenHint: hint,
      tokenHintsByAddress: {
        ...prepared.tokenHintsByAddress,
        [tokenAddress.toLowerCase()]: hint,
      },
    };
  }

  protected highlightFieldIds(ctx: TypedDataContext): string[] {
    const ids = super.highlightFieldIds(ctx);
    if (this.hasFields(ctx, ["token"])) ids.push("message.token");
    if (this.hasFields(ctx, ["sigDeadline"])) ids.push("message.sigDeadline");
    return ids;
  }
}
