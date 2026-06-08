import type { ViewFieldDescriptor } from "../field_descriptor.ts";
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

  protected mutateFields(fields: ViewFieldDescriptor[], ctx: TypedDataContext): ViewFieldDescriptor[] {
    void ctx;
    return this.highlightIds(fields, this.messageFieldIds(fields));
  }
}
