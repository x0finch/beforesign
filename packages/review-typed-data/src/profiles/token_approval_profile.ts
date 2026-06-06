import type { ClientsBundle } from "@beforesign/clients";
import type { JsonValue, ReviewCheckItem, WarningItem } from "@beforesign/core";
import { MAX_UINT256 } from "../format_field.ts";
import { domainChainId, fetchTokenHint } from "../token_hints.ts";
import type { TypedDataContext } from "./context.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

export abstract class TokenApprovalProfile extends TypedDataProfile {
  protected allowanceFieldIds = [
    "message.value",
    "message.allowed",
    "message.amount",
    "message.details.amount",
  ];

  async prepareContext(
    ctx: TypedDataContext,
    clients: ClientsBundle,
  ): Promise<TypedDataContext> {
    const verifyingContract =
      typeof ctx.domain.verifyingContract === "string"
        ? ctx.domain.verifyingContract
        : undefined;
    if (!verifyingContract) return ctx;

    const hint = await fetchTokenHint(
      domainChainId(ctx.domain),
      verifyingContract,
      clients.etherscan,
    );
    if (!hint) return ctx;

    return {
      ...ctx,
      tokenHint: hint,
      tokenHintsByAddress: {
        ...ctx.tokenHintsByAddress,
        [verifyingContract.toLowerCase()]: hint,
      },
    };
  }

  buildExternalFacts(ctx: TypedDataContext): Record<string, JsonValue> {
    if (!ctx.tokenHint) return {};
    return {
      tokenSymbol: ctx.tokenHint.symbol,
      tokenDecimals: ctx.tokenHint.decimals,
    };
  }

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    let result = this.highlightIds(checks, this.summaryFocusIds(ctx));
    const allowanceIds = new Set(this.allowanceFieldIds);
    result = result.map((check) =>
      allowanceIds.has(check.id) ? { ...check, label: "Allowance" } : check,
    );
    for (const id of this.allowanceFieldIds) {
      const check = result.find((c) => c.id === id);
      if (check?.value === MAX_UINT256) {
        result = this.setRiskOnId(result, id, "destructive");
      }
    }
    return this.setDescriptions(result, this.buildDescriptionMap(result, ctx));
  }

  protected buildDescriptionMap(
    checks: ReviewCheckItem[],
    ctx: TypedDataContext,
  ): Record<string, string> {
    void ctx;
    const descriptions: Record<string, string> = {};

    if (checks.some((c) => c.id === "message.owner")) {
      descriptions["message.owner"] =
        "Owner must be an address you control (not spender or relayer)";
    }
    if (checks.some((c) => c.id === "message.spender")) {
      descriptions["message.spender"] =
        "Spender can move your tokens on-chain within the allowance";
    }

    const allowanceId = this.firstExistingCheckId(checks, this.allowanceFieldIds);
    if (allowanceId) {
      descriptions[allowanceId] = "Unlimited allowance equals on-chain approve(max)";
    }

    const deadlineId = this.firstExistingCheckId(checks, [
      "message.deadline",
      "message.expiration",
      "message.sigDeadline",
    ]);
    if (deadlineId) {
      descriptions[deadlineId] = "Confirm deadline is acceptable and not already expired";
    }

    if (checks.some((c) => c.id === "message.nonce")) {
      descriptions["message.nonce"] =
        "Nonce prevents replay; should align with on-chain state";
    }

    return descriptions;
  }

  protected buildWarnings(ctx: TypedDataContext, checks: ReviewCheckItem[]): WarningItem[] {
    void checks;
    const deadlineFields = ["deadline", "expiration", "sigDeadline"];
    const warnings: WarningItem[] = [
      ...this.warnExpiredDeadline(ctx, deadlineFields),
    ];
    const ownerMismatch = this.warnSignerFieldMismatch(ctx, "owner");
    if (ownerMismatch) warnings.push(ownerMismatch);
    const longDeadline = this.warnLongDeadline(ctx, deadlineFields);
    if (longDeadline) warnings.push(longDeadline);
    return warnings;
  }

  protected summaryFocusIds(ctx: TypedDataContext): string[] {
    const ids: string[] = [];
    if (this.hasFields(ctx, ["owner"])) ids.push("message.owner");
    if (this.hasFields(ctx, ["spender"])) ids.push("message.spender");
    if (this.hasFields(ctx, ["value"])) ids.push("message.value");
    if (this.hasFields(ctx, ["allowed"])) ids.push("message.allowed");
    if (this.hasFields(ctx, ["amount"])) ids.push("message.amount");
    return ids;
  }
}
