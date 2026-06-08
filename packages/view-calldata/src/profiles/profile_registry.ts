import type { CalldataProfile } from "./calldata_profile.ts";
import { ApprovalProfile } from "./approval_profile.ts";
import type { CalldataViewContext } from "./context.ts";
import { GenericProfile } from "./generic_profile.ts";

const profiles: CalldataProfile[] = [
  new ApprovalProfile(),
  new GenericProfile(),
].sort((a, b) => b.priority - a.priority);

export class ProfileRegistry {
  constructor(private readonly items: CalldataProfile[] = profiles) {}

  resolve(ctx: CalldataViewContext): CalldataProfile {
    return this.items.find((profile) => profile.match(ctx)) ?? new GenericProfile();
  }
}

export const defaultRegistry = new ProfileRegistry();
