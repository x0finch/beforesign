import type { Spec } from "@json-render/core";
import { componentGallerySpec } from "./component_gallery.ts";
import { minimalCardSpec } from "./minimal_card.ts";
import { sampleCalldataSpec } from "../sample_calldata_spec.ts";

export type DemoSpecCase = {
  id: string;
  label: string;
  description: string;
  spec: Spec;
};

export const DEMO_SPEC_CASES: DemoSpecCase[] = [
  {
    id: "calldata-transfer",
    label: "Calldata transfer",
    description: "Nested Accordion + Field rows + AlertList",
    spec: sampleCalldataSpec,
  },
  {
    id: "minimal-card",
    label: "Minimal card",
    description: "Single Card with Text child",
    spec: minimalCardSpec,
  },
  {
    id: "component-gallery",
    label: "Component gallery",
    description: "All nine catalog components",
    spec: componentGallerySpec,
  },
];
