import { siweFixture } from "./auth/siwe.ts";
import { mailFixture } from "./generic/mail.ts";
import { delegationFixture } from "./governance/delegation.ts";
import { orderFixture } from "./order/order.ts";
import { permit2Fixture } from "./permit2/permit2.ts";
import { fieldSignatureFooFixture } from "./token_permit/field_signature_foo.ts";
import { ownerMatchFixture } from "./token_permit/owner_match.ts";
import { ownerMismatchFixture } from "./token_permit/owner_mismatch.ts";
import { typedDataIntegrationFixture } from "./token_permit/typed_data_integration.ts";
import { unlimitedPermitFixture } from "./token_permit/unlimited_permit.ts";
import { usdcPermitFixture } from "./token_permit/usdc_permit.ts";
import type { ReviewFixture } from "./types.ts";

export const REVIEW_FIXTURE_CASES: ReviewFixture[] = [
  usdcPermitFixture,
  fieldSignatureFooFixture,
  ownerMismatchFixture,
  ownerMatchFixture,
  unlimitedPermitFixture,
  typedDataIntegrationFixture,
  permit2Fixture,
  orderFixture,
  delegationFixture,
  siweFixture,
  mailFixture,
];

export const FIXTURE_FILE_BY_NAME: Record<string, string> = {
  usdcPermit: "token_permit/usdc_permit.ts",
  fieldSignatureFoo: "token_permit/field_signature_foo.ts",
  ownerMismatch: "token_permit/owner_mismatch.ts",
  ownerMatch: "token_permit/owner_match.ts",
  unlimitedPermit: "token_permit/unlimited_permit.ts",
  typedDataIntegration: "token_permit/typed_data_integration.ts",
  permit2: "permit2/permit2.ts",
  order: "order/order.ts",
  delegation: "governance/delegation.ts",
  siwe: "auth/siwe.ts",
  mail: "generic/mail.ts",
};

export type { ReviewFixture } from "./types.ts";
export { FIXTURE_NOW_MS } from "./clock.ts";
export { usdcPermitFixture } from "./token_permit/usdc_permit.ts";
