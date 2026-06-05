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
import { Tabs, TabsList, TabsPanel, TabsTab } from "@beforesign/ui/tabs";
import { groupChecksBySection } from "./group_checks.ts";
import { ReviewCheckGroup } from "./review_check_group.tsx";
import { ReviewCollapsibleSection } from "./review_collapsible_section.tsx";
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
  return (
    <div className="flex flex-col gap-4 text-sm">
      {showWarnings && warnings.length > 0 && (
        <ReviewWarningList warnings={warnings} />
      )}

      {sections.map((section) => (
        <ReviewCheckGroup key={section.id} section={section} />
      ))}

      <ReviewGuidanceSection checks={guidance} mode={guidanceMode} />

      {showFacts && (
        <ReviewCollapsibleSection title="Facts" dataGroup="facts">
          <ReviewFactsList facts={document.facts ?? {}} />
        </ReviewCollapsibleSection>
      )}
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
