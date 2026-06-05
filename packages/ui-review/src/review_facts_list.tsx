import type { JsonValue, ReviewCheckItem } from "@beforesign/core";
import { Empty, EmptyDescription } from "@beforesign/ui/empty";
import { factsToRows } from "./facts_to_rows.ts";
import { ReviewAccordionSection, ReviewSectionList } from "./review_section.tsx";

function factToCheck(row: ReturnType<typeof factsToRows>[number]): ReviewCheckItem {
  return {
    id: row.id,
    group: "facts",
    label: row.label,
    value: row.value,
    displayValue: row.displayValue,
    kind: row.kind,
  };
}

export function ReviewFactsList({ facts }: { facts: Record<string, JsonValue> }) {
  const rows = factsToRows(facts);
  const checks = rows.map(factToCheck);

  return (
    <ReviewAccordionSection id="facts" title="Facts" defaultOpen={false}>
      {checks.length === 0 ? (
        <Empty>
          <EmptyDescription>No facts</EmptyDescription>
        </Empty>
      ) : (
        <ReviewSectionList checks={checks} showId={false} />
      )}
    </ReviewAccordionSection>
  );
}
