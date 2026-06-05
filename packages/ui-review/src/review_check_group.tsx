import { Card, CardHeader, CardPanel, CardTitle } from "@beforesign/ui/card";
import { Table, TableBody } from "@beforesign/ui/table";
import type { ReviewSection } from "./types.ts";
import { ReviewCheckRow } from "./review_check_row.tsx";

export function ReviewCheckGroup({ section }: { section: ReviewSection }) {
  return (
    <Card data-group={section.id}>
      <CardHeader>
        <CardTitle>{section.label}</CardTitle>
      </CardHeader>
      <CardPanel>
        <Table variant="card">
          <TableBody>
            {section.checks.map((check) => (
              <ReviewCheckRow key={check.id} check={check} />
            ))}
          </TableBody>
        </Table>
      </CardPanel>
    </Card>
  );
}
