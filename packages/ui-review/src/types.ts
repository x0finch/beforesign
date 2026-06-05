import type { ReviewCheckItem } from "@beforesign/core";

export type ReviewSectionGroup = {
  id: string;
  label: string;
  checks: ReviewCheckItem[];
};

export type GroupedChecks = {
  sections: ReviewSectionGroup[];
  guidance: ReviewCheckItem[];
};
