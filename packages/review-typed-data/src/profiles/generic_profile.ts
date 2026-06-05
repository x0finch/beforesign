import type { ReviewCheckItem } from "@beforesign/core";
import type { TypedDataContext } from "./context.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

export class GenericProfile extends TypedDataProfile {
  readonly id = "generic" as const;
  readonly priority = 0;

  match(ctx: TypedDataContext): boolean {
    void ctx;
    return true;
  }

  summary(ctx: TypedDataContext): string {
    return `EIP-712 signature: verify ${ctx.normalized.primaryType} fields before signing`;
  }

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    void ctx;
    return this.highlightIds(checks, this.messageCheckIds(checks));
  }
}
