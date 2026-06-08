import type { FieldDescriptorInput } from "@beforesign/json-render-catalog";

export type ViewFieldDescriptor = FieldDescriptorInput & {
  id: string;
  group: string;
};
