import { describe, expect, it } from "vitest";
import { validateSpec } from "@beforesign/json-render-catalog";
import { buildContext } from "../src/build_context.ts";
import { buildTypedDataSpec } from "../src/build_typed_data_spec.ts";
import { usdcPermitFixture } from "./fixtures/token_permit/usdc_permit.ts";

describe("buildTypedDataSpec", () => {
  it("builds a valid USDC permit spec", () => {
    const normalized = JSON.parse(usdcPermitFixture.input) as Parameters<typeof buildContext>[0];
    const ctx = buildContext(normalized);
    const result = buildTypedDataSpec(ctx);

    expect(validateSpec(result.spec as never).valid).toBe(true);
    expect(result.scenarioId).toBe("tokenPermit");
    const elements = Object.values(result.spec.elements) as Array<{
      type: string;
      props: { title?: string };
    }>;
    expect(elements.some((element) => element.type === "Section" && element.props.title === "Domain")).toBe(
      true,
    );
  });
});
