import type { ReviewCheckItem } from "@beforesign/core";
import { ReviewAccordionSection, ReviewSectionList } from "./review_section.tsx";

export function ReviewGuidanceSection({
  checks,
  mode = "inline",
}: {
  checks: ReviewCheckItem[];
  mode?: "inline" | "collapsed" | "hidden";
}) {
  if (mode === "hidden" || checks.length === 0) return null;

  return (
    <ReviewAccordionSection
      id="guidance"
      title="Guidance"
      defaultOpen={mode === "inline"}
    >
      <ReviewSectionList checks={checks} layout="guidance" showId={false} />
    </ReviewAccordionSection>
  );
}
