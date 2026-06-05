import type { TypedDataContext } from "./context.ts";
import { TokenApprovalProfile } from "./token_approval_profile.ts";

export class TokenPermitProfile extends TokenApprovalProfile {
  readonly id = "tokenPermit" as const;
  readonly priority = 70;

  match(ctx: TypedDataContext): boolean {
    if (ctx.normalized.primaryType === "Permit") return true;
    return this.hasFields(ctx, ["owner", "spender", "value"]);
  }

  summary(ctx: TypedDataContext): string {
    void ctx;
    return "Token permit: verify owner, spender, and allowance before signing";
  }
}
