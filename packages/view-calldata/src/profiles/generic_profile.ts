import type { ViewFieldDescriptor } from "../field_descriptor.ts";
import type { CalldataViewContext } from "./context.ts";
import { CalldataProfile } from "./calldata_profile.ts";

export class GenericProfile extends CalldataProfile {
  readonly id = "generic" as const;
  readonly priority = 0;

  match(ctx: CalldataViewContext): boolean {
    void ctx;
    return true;
  }

  summary(ctx: CalldataViewContext): string {
    const fn = ctx.tree.functionName;
    return fn
      ? `Contract call: verify ${fn} arguments`
      : "Contract calldata: verify selector and arguments";
  }

  protected buildFieldOverrides(
    ctx: CalldataViewContext,
    fields: ViewFieldDescriptor[],
  ): Map<string, Partial<ViewFieldDescriptor>> {
    void ctx;
    const ids = this.rootArgIds(fields).filter((id) =>
      fields.some((field) => field.id === id),
    );
    return this.highlightIds(fields, ids);
  }
}
