import type { ViewFieldDescriptor } from "../field_descriptor.ts";
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

  protected mutateFields(fields: ViewFieldDescriptor[], ctx: TypedDataContext): ViewFieldDescriptor[] {
    return this.highlightIds(fields, this.summaryFocusIds(ctx, fields));
  }

  protected summaryFocusIds(ctx: TypedDataContext, fields: ViewFieldDescriptor[]): string[] {
    const ids: string[] = [];
    if (this.hasFields(ctx, ["zone"])) ids.push("message.zone");
    for (const field of fields) {
      if (
        field.id.startsWith("message.offer") ||
        field.id.startsWith("message.consideration")
      ) {
        ids.push(field.id);
      }
    }
    return [...new Set(ids)];
  }
}
