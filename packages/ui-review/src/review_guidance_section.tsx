import type { ReviewCheckItem } from "@beforesign/core";
import { Card, CardHeader, CardPanel, CardTitle } from "@beforesign/ui/card";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@beforesign/ui/collapsible";
import { Field, FieldDescription, FieldLabel } from "@beforesign/ui/field";
import * as React from "react";

function GuidanceRow({ check }: { check: ReviewCheckItem }) {
  return (
    <Field>
      <FieldLabel>{check.label}</FieldLabel>
      <FieldDescription>{check.value}</FieldDescription>
    </Field>
  );
}

export function ReviewGuidanceSection({
  checks,
  mode = "inline",
}: {
  checks: ReviewCheckItem[];
  mode?: "inline" | "collapsed" | "hidden";
}) {
  const [open, setOpen] = React.useState(mode === "inline");

  if (mode === "hidden" || checks.length === 0) return null;

  const rows = (
    <div className="flex flex-col gap-4">
      {checks.map((check) => (
        <GuidanceRow key={check.id} check={check} />
      ))}
    </div>
  );

  if (mode === "collapsed") {
    return (
      <Card data-group="guidance">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CardHeader>
            <CollapsibleTrigger>
              {open ? "Hide guidance" : `Show guidance (${checks.length})`}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsiblePanel>
            <CardPanel>{rows}</CardPanel>
          </CollapsiblePanel>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card data-group="guidance">
      <CardHeader>
        <CardTitle>Guidance</CardTitle>
      </CardHeader>
      <CardPanel>{rows}</CardPanel>
    </Card>
  );
}
