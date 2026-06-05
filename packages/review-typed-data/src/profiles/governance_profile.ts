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
    return this.highlightIds(checks, this.summaryFocusIds(ctx));
  }

  protected summaryFocusIds(ctx: TypedDataContext): string[] {
    const ids: string[] = [];
    if (this.hasFields(ctx, ["delegatee"])) ids.push("message.delegatee");
    for (const field of ["delegator", "voter", "proposalId", "support", "power", "balance"]) {
      if (this.hasFields(ctx, [field])) ids.push(`message.${field}`);
    }
    return ids;
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
