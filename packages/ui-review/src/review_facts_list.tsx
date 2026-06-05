import type { JsonValue, ReviewCheckItem } from "@beforesign/core";
import { Empty, EmptyDescription } from "@beforesign/ui/empty";
import { factsToRows } from "./facts_to_rows.ts";
import { ReviewSection } from "./review_section.tsx";

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
  const checks = factsToRows(facts).map(factToCheck);

  return (
    <ReviewSection
      id="facts"
      title="Facts"
      checks={checks}
      showId={false}
      collapsible
      defaultOpen={false}
      empty={
        <Empty>
          <EmptyDescription>No facts</EmptyDescription>
        </Empty>
      }
    />
  );
}
