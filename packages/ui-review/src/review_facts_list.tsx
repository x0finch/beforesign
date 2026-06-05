import type { JsonValue, ReviewCheckItem } from "@beforesign/core";
import { Empty, EmptyDescription } from "@beforesign/ui/empty";
import { Table, TableBody } from "@beforesign/ui/table";
import { factsToRows } from "./facts_to_rows.ts";
import { ReviewCheckRow } from "./review_check_row.tsx";

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

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyDescription>No facts</EmptyDescription>
      </Empty>
    );
  }

  return (
    <Table variant="card">
      <TableBody>
        {rows.map((row) => (
          <ReviewCheckRow key={row.id} check={factToCheck(row)} showId={false} />
        ))}
      </TableBody>
    </Table>
  );
}
