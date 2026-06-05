import type { ReviewCheckItem, WarningItem } from "@beforesign/core";
import type { TypedDataContext } from "./context.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

export class GovernanceProfile extends TypedDataProfile {
  readonly id = "governance" as const;
  readonly priority = 50;

  match(ctx: TypedDataContext): boolean {
    const primary = ctx.normalized.primaryType;
    if (/vote|delegation/i.test(primary)) return true;
    if (this.hasFields(ctx, ["delegatee"])) return true;
    if (this.hasFields(ctx, ["delegator"]) && this.hasFields(ctx, ["delegatee"])) return true;
    return false;
  }

  summary(ctx: TypedDataContext): string {
    return `Governance signature (${ctx.normalized.primaryType}): verify delegatee and delegation scope`;
  }

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    const ids = ["signature.signableHash", "domain.chainId"];
    if (this.hasFields(ctx, ["delegatee"])) ids.push("message.delegatee");
    if (this.hasFields(ctx, ["delegator"])) ids.push("message.delegator");
    if (this.hasFields(ctx, ["voter"])) ids.push("message.voter");
    if (this.hasFields(ctx, ["proposalId"])) ids.push("message.proposalId");
    if (this.hasFields(ctx, ["support"])) ids.push("message.support");
    if (this.hasFields(ctx, ["power"])) ids.push("message.power");
    if (this.hasFields(ctx, ["balance"])) ids.push("message.balance");
    return this.highlightIds(checks, ids);
  }

  protected buildGuidance(ctx: TypedDataContext): ReviewCheckItem[] {
    void ctx;
    return this.addGuidance([
      {
        id: "guidance.delegatee",
        label: "Delegatee",
        value: "Delegatee will act on your behalf within the signed scope",
      },
      {
        id: "guidance.scope",
        label: "Scope",
        value: "Confirm token amount, proposal ID, and whether delegation is permanent or one-time",
      },
    ]);
  }

  protected buildWarnings(ctx: TypedDataContext, checks: ReviewCheckItem[]): WarningItem[] {
    void checks;
    const warnings: WarningItem[] = [];
    const delegatorMismatch = this.warnSignerFieldMismatch(ctx, "delegator", "delegatorMismatch");
    if (delegatorMismatch) warnings.push(delegatorMismatch);
    const voterMismatch = this.warnSignerFieldMismatch(ctx, "voter", "voterMismatch");
    if (voterMismatch) warnings.push(voterMismatch);
    return warnings;
  }
}
