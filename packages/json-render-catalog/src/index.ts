export { catalog, componentNames, actionNames, type Catalog } from "./catalog.ts";
export type { AccordionProps } from "./components/core.ts";
export type { FieldProps } from "./components/field_kind.ts";
export type { AlertListProps, AlertItem } from "./components/alert_severity.ts";
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
