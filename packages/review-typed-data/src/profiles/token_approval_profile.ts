import type { ReviewCheckItem, WarningItem } from "@beforesign/core";
import { MAX_UINT256 } from "../format_field.ts";
import type { TypedDataContext } from "./context.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

export abstract class TokenApprovalProfile extends TypedDataProfile {
  protected allowanceFieldIds = ["message.value", "message.allowed", "message.amount"];

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    let result = this.highlightIds(checks, this.highlightFieldIds(ctx));
    for (const id of this.allowanceFieldIds) {
      const check = result.find((c) => c.id === id);
      if (check?.value === MAX_UINT256) {
        result = this.setRiskOnId(result, id, "destructive");
      }
    }
    return result;
  }

  protected buildGuidance(ctx: TypedDataContext): ReviewCheckItem[] {
    void ctx;
    return this.addGuidance([
      {
        id: "guidance.owner",
        label: "Owner",
        value: "Owner must be an address you control (not spender or relayer)",
      },
      {
        id: "guidance.spender",
        label: "Spender",
        value: "Spender can move your tokens on-chain within the allowance",
      },
      {
        id: "guidance.value",
        label: "Allowance",
        value: "Unlimited allowance equals on-chain approve(max)",
      },
      {
        id: "guidance.deadline",
        label: "Deadline",
        value: "Confirm deadline is acceptable and not already expired",
      },
      {
        id: "guidance.nonce",
        label: "Nonce",
        value: "Nonce prevents replay; should align with on-chain state",
      },
    ]);
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

  protected highlightFieldIds(ctx: TypedDataContext): string[] {
    const ids = [
      "domain.chainId",
      "domain.verifyingContract",
      "signature.signableHash",
    ];
    if (this.hasFields(ctx, ["owner"])) ids.push("message.owner");
    if (this.hasFields(ctx, ["spender"])) ids.push("message.spender");
    if (this.hasFields(ctx, ["value"])) ids.push("message.value");
    if (this.hasFields(ctx, ["allowed"])) ids.push("message.allowed");
    if (this.hasFields(ctx, ["amount"])) ids.push("message.amount");
    if (this.hasFields(ctx, ["deadline"])) ids.push("message.deadline");
    if (this.hasFields(ctx, ["expiration"])) ids.push("message.expiration");
    return ids;
  }
}
