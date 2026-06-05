import type { ReviewSectionGroup } from "./types.ts";
import { ReviewSection } from "./review_section.tsx";

export function ReviewCheckGroup({ section }: { section: ReviewSectionGroup }) {
  return (
    <ReviewSection
      id={section.id}
      title={section.label}
      checks={section.checks}
      layout="keyValue"
    />
  );
}
