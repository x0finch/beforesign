import type { ReviewCheckItem } from "@beforesign/core";
import type { TypedDataContext } from "./context.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

export class OrderProfile extends TypedDataProfile {
  readonly id = "order" as const;
  readonly priority = 60;

  match(ctx: TypedDataContext): boolean {
    const primary = ctx.normalized.primaryType;
    if (/order/i.test(primary)) return true;
    const domainName = this.getDomainString(ctx, "name") ?? "";
    if (/seaport|0x|blur/i.test(domainName)) return true;
    if (this.hasFields(ctx, ["offer"]) && this.hasFields(ctx, ["consideration"])) return true;
    return false;
  }

  summary(ctx: TypedDataContext): string {
    void ctx;
    return "Marketplace order: verify tokens offered, received, fees, and who can fill the order";
  }

  protected mutateChecks(checks: ReviewCheckItem[], ctx: TypedDataContext): ReviewCheckItem[] {
    return this.highlightIds(checks, this.summaryFocusIds(ctx, checks));
  }

  protected summaryFocusIds(ctx: TypedDataContext, checks: ReviewCheckItem[]): string[] {
    const ids: string[] = [];
    if (this.hasFields(ctx, ["zone"])) ids.push("message.zone");
    for (const check of checks) {
      if (
        check.id.startsWith("message.offer") ||
        check.id.startsWith("message.consideration")
      ) {
        ids.push(check.id);
      }
    }
    return [...new Set(ids)];
  }

  protected buildGuidance(ctx: TypedDataContext): ReviewCheckItem[] {
    void ctx;
    return this.addGuidance([
      {
        id: "guidance.tokens",
        label: "Tokens",
        value: "Review which tokens and amounts you give versus receive",
      },
      {
        id: "guidance.fees",
        label: "Fees",
        value: "Check fees, royalties, and extra consideration items",
      },
      {
        id: "guidance.filler",
        label: "Filler",
        value: "Confirm whether any address can fill this signed order",
      },
    ]);
  }
}
