import { z } from "zod";
import { alertListPropsSchema } from "./alert_severity.ts";
import { fieldPropsSchema } from "./field_kind.ts";

const gapSchema = z.enum(["sm", "md", "lg"]);

const textVariantSchema = z.enum(["body", "caption", "mono"]);

const badgeVariantSchema = z.enum(["default", "success", "error", "info"]);

export const coreComponentDefinitions = {
  Card: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
      badge: z.string().nullable(),
    }),
    slots: ["default"],
    description: "Titled container with optional description and badge",
  },
  Stack: {
    props: z.object({
      gap: gapSchema.nullable(),
    }),
    slots: ["default"],
    description: "Vertical stack of child elements",
  },
  Section: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
    }),
    slots: ["default"],
    description: "Grouped section with a heading",
  },
  Accordion: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
      defaultExpanded: z.boolean().nullable(),
    }),
    slots: ["default"],
    description: "Collapsible block; toggle expand/collapse in registry",
  },
  Text: {
    props: z.object({
      content: z.string(),
      variant: textVariantSchema.nullable(),
    }),
    description: "Text paragraph or caption",
  },
  Field: {
    props: fieldPropsSchema,
    description: "Label and value row for structured data",
  },
  AlertList: {
    props: alertListPropsSchema,
    description: "List of severity-colored alerts",
  },
  Badge: {
    props: z.object({
      label: z.string(),
      variant: badgeVariantSchema.nullable(),
    }),
    description: "Inline badge label",
  },
  Divider: {
    props: z.object({}),
    description: "Horizontal divider between blocks",
  },
};

export type CoreComponentName = keyof typeof coreComponentDefinitions;

export const accordionPropsSchema = coreComponentDefinitions.Accordion.props;
export type AccordionProps = z.infer<typeof accordionPropsSchema>;

export {
  alertListPropsSchema,
  alertItemSchema,
  alertSeveritySchema,
} from "./alert_severity.ts";
export {
  fieldPropsSchema,
  fieldKindSchema,
  fieldBadgeVariantSchema,
  fieldRiskSchema,
} from "./field_kind.ts";
