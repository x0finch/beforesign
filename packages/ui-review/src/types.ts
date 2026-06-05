import type { ReviewCheckItem } from "@beforesign/core";

export type ReviewSection = {
  id: string;
  label: string;
  checks: ReviewCheckItem[];
};

export type GroupedChecks = {
  sections: ReviewSection[];
  guidance: ReviewCheckItem[];
};
