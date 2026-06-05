import type { ReviewDocument, WarningItem } from "@beforesign/core";
import { Badge } from "@beforesign/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@beforesign/ui/card";
import { Separator } from "@beforesign/ui/separator";
import { TooltipProvider } from "@beforesign/ui/tooltip";
import * as React from "react";
import { groupChecksBySection } from "./group_checks.ts";
import { ReviewFactsList } from "./review_facts_list.tsx";
import { ReviewSection } from "./review_section.tsx";
import { dedupeWarnings, ReviewWarningList } from "./review_warning_list.tsx";

function ReviewBody({
  document,
  showWarnings,
  showFacts,
  warnings,
  sections,
}: {
  document: ReviewDocument;
  showWarnings: boolean;
  showFacts: boolean;
  warnings: WarningItem[];
  sections: ReturnType<typeof groupChecksBySection>["sections"];
}) {
  const blocks: { id: string; node: React.ReactNode }[] = [];

  if (showWarnings && warnings.length > 0) {
    blocks.push({
      id: "warnings",
      node: <ReviewWarningList warnings={warnings} />,
    });
  }

  for (const section of sections) {
    blocks.push({
      id: section.id,
      node: (
        <ReviewSection id={section.id} title={section.label} checks={section.checks} />
      ),
    });
  }

  if (showFacts) {
    blocks.push({
      id: "facts",
      node: <ReviewFactsList facts={document.facts ?? {}} />,
    });
  }

  return (
    <div className="flex flex-col text-sm">
      {blocks.map((block, index) => {
        const prev = index > 0 ? blocks[index - 1] : undefined;
        const afterWarnings = prev?.id === "warnings";

        return (
          <React.Fragment key={block.id}>
            {index > 0 &&
              (afterWarnings ? (
                <div className="mt-4" aria-hidden="true" />
              ) : (
                <Separator className="my-4" />
              ))}
            {block.node}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function ReviewDocumentView({
  document,
  extraWarnings,
  showWarnings = true,
  showBadges = true,
  showFacts = true,
}: {
  document: ReviewDocument;
  extraWarnings?: WarningItem[];
  showWarnings?: boolean;
  showBadges?: boolean;
  showFacts?: boolean;
}) {
  const { sections } = groupChecksBySection(document.checks);
  const warnings = showWarnings ? dedupeWarnings(document, extraWarnings) : document.warnings;
  const scenarioId =
    document.facts && typeof document.facts.scenarioId === "string"
      ? document.facts.scenarioId
      : undefined;

  const body = (
    <ReviewBody
      document={document}
      showWarnings={showWarnings}
      showFacts={showFacts}
      warnings={warnings}
      sections={sections}
    />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{document.title}</CardTitle>
        <CardDescription>{document.summary}</CardDescription>
        {showBadges && scenarioId && (
          <CardAction>
            <Badge className="capitalize">{scenarioId}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardPanel>
        <TooltipProvider delay={0}>{body}</TooltipProvider>
      </CardPanel>
    </Card>
  );
}
