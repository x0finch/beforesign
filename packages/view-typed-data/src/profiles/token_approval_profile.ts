import type { ClientsBundle } from "@beforesign/clients";
import type { JsonValue, WarningItem } from "@beforesign/core";
import { MAX_UINT256 } from "../format_field.ts";
import type { ViewFieldDescriptor } from "../field_descriptor.ts";
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

  protected mutateFields(fields: ViewFieldDescriptor[], ctx: TypedDataContext): ViewFieldDescriptor[] {
    let result = this.highlightIds(fields, this.summaryFocusIds(ctx));
    const allowanceIds = new Set(this.allowanceFieldIds);
    result = result.map((field) =>
      allowanceIds.has(field.id) ? { ...field, label: "Allowance" } : field,
    );
    for (const id of this.allowanceFieldIds) {
      const field = result.find((item) => item.id === id);
      if (field?.value === MAX_UINT256) {
        result = this.setRiskOnId(result, id, "destructive");
      }
    }
    return result;
  }

  protected buildWarnings(ctx: TypedDataContext, fields: ViewFieldDescriptor[]): WarningItem[] {
    void fields;
    const deadlineFields = ["deadline", "expiration", "sigDeadline"];
    const warnings: WarningItem[] = [...this.warnExpiredDeadline(ctx, deadlineFields)];
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
