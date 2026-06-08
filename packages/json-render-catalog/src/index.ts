export { catalog, componentNames, actionNames, type Catalog } from "./catalog.ts";
export type { Spec, SpecValidationIssues } from "@json-render/core";
export { validateSpec } from "@json-render/core";
export {
  appendElements,
  buildSpec,
  createElement,
  createElementId,
  resetElementIds,
  type ViewElement,
  type ViewSpecInput,
} from "./spec_helpers.ts";
