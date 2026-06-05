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
import { Frame, FramePanel } from "@beforesign/ui/frame";
import { Separator } from "@beforesign/ui/separator";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@beforesign/ui/tabs";
import * as React from "react";
import { groupChecksBySection } from "./group_checks.ts";
import { ReviewCheckGroup } from "./review_check_group.tsx";
import { ReviewFactsList } from "./review_facts_list.tsx";
import { ReviewGuidanceSection } from "./review_guidance_section.tsx";
import { dedupeWarnings, ReviewWarningList } from "./review_warning_list.tsx";

function ReviewBody({
  document,
  guidanceMode,
  showWarnings,
  showFacts,
  warnings,
  sections,
  guidance,
}: {
  document: ReviewDocument;
  guidanceMode: "inline" | "collapsed" | "hidden";
  showWarnings: boolean;
  showFacts: boolean;
  warnings: WarningItem[];
  sections: ReturnType<typeof groupChecksBySection>["sections"];
  guidance: ReturnType<typeof groupChecksBySection>["guidance"];
}) {
  const blocks: React.ReactNode[] = [];

  if (showWarnings && warnings.length > 0) {
    blocks.push(<ReviewWarningList key="warnings" warnings={warnings} />);
  }

  for (const section of sections) {
    blocks.push(<ReviewCheckGroup key={section.id} section={section} />);
  }

  if (guidanceMode !== "hidden" && guidance.length > 0) {
    blocks.push(
      <ReviewGuidanceSection key="guidance" checks={guidance} mode={guidanceMode} />,
    );
  }

  if (showFacts) {
    blocks.push(<ReviewFactsList key="facts" facts={document.facts ?? {}} />);
  }

  return (
    <div className="flex flex-col text-sm">
      {blocks.map((block, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Separator className="my-4" />}
          {block}
        </React.Fragment>
      ))}
    </div>
  );
}

export function ReviewDocumentView({
  document,
  guidanceMode = "inline",
  extraWarnings,
  showWarnings = true,
  showBadges = true,
  showFacts = true,
  showRawTab = false,
}: {
  document: ReviewDocument;
  guidanceMode?: "inline" | "collapsed" | "hidden";
  extraWarnings?: WarningItem[];
  showWarnings?: boolean;
  showBadges?: boolean;
  showFacts?: boolean;
  showRawTab?: boolean;
}) {
  const { sections, guidance } = groupChecksBySection(document.checks);
  const warnings = showWarnings ? dedupeWarnings(document, extraWarnings) : document.warnings;
  const scenarioId =
    document.facts && typeof document.facts.scenarioId === "string"
      ? document.facts.scenarioId
      : undefined;

  const body = (
    <ReviewBody
      document={document}
      guidanceMode={guidanceMode}
      showWarnings={showWarnings}
      showFacts={showFacts}
      warnings={warnings}
      sections={sections}
      guidance={guidance}
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
        {showRawTab ? (
          <Tabs defaultValue="review">
            <TabsList>
              <TabsTab value="review">Review</TabsTab>
              <TabsTab value="raw">Raw JSON</TabsTab>
            </TabsList>
            <TabsPanel value="review">{body}</TabsPanel>
            <TabsPanel value="raw">
              <Frame>
                <FramePanel>
                  <pre className="overflow-auto font-mono text-xs">
                    {JSON.stringify(document, null, 2)}
                  </pre>
                </FramePanel>
              </Frame>
            </TabsPanel>
          </Tabs>
        ) : (
          body
        )}
      </CardPanel>
    </Card>
  );
}
