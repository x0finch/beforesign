import { AuthSiweProfile } from "./auth_siwe_profile.ts";
import type { TypedDataContext } from "./context.ts";
import { GenericProfile } from "./generic_profile.ts";
import { GovernanceProfile } from "./governance_profile.ts";
import { OrderProfile } from "./order_profile.ts";
import { Permit2Profile } from "./permit2_profile.ts";
import { TokenPermitProfile } from "./token_permit_profile.ts";
import { TypedDataProfile } from "./typed_data_profile.ts";

export class ProfileRegistry {
  private readonly generic: GenericProfile;
  private readonly profiles: TypedDataProfile[];

  constructor(profiles: TypedDataProfile[], generic: GenericProfile) {
    this.generic = generic;
    this.profiles = [...profiles].sort((a, b) => b.priority - a.priority);
  }

  resolve(ctx: TypedDataContext): TypedDataProfile {
    return this.profiles.find((profile) => profile.match(ctx)) ?? this.generic;
  }
}

const genericProfile = new GenericProfile();

export const defaultRegistry = new ProfileRegistry(
  [
    new AuthSiweProfile(),
    new Permit2Profile(),
    new TokenPermitProfile(),
    new OrderProfile(),
    new GovernanceProfile(),
  ],
  genericProfile,
);
