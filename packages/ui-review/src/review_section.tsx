import type { ReviewCheckItem } from "@beforesign/core";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@beforesign/ui/accordion";
import { cn } from "@beforesign/ui/utils";
import type { ReactNode } from "react";
import { ReviewSectionItem } from "./review_section_item.tsx";

const sectionTitleClass = "font-semibold text-lg leading-none";

function ReviewSectionShell({
  id,
  title,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  if (collapsible) {
    return (
      <section data-group={id}>
        <Accordion defaultValue={defaultOpen ? [id] : []}>
          <AccordionItem value={id} className="border-0">
            <AccordionTrigger className={cn(sectionTitleClass, "py-0 text-lg")}>
              {title}
            </AccordionTrigger>
            <AccordionPanel className="pt-4 text-foreground">{children}</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </section>
    );
  }

  return (
    <section data-group={id} className="flex flex-col gap-4">
      <h3 className={sectionTitleClass}>{title}</h3>
      {children}
    </section>
  );
}

export function ReviewSectionList({
  checks,
  showId = true,
}: {
  checks: ReviewCheckItem[];
  showId?: boolean;
}) {
  return (
    <div data-slot="review-section-list" className="-mx-2 flex flex-col px-2">
      {checks.map((check) => (
        <ReviewSectionItem key={check.id} check={check} showId={showId} />
      ))}
    </div>
  );
}

export function ReviewSection({
  id,
  title,
  checks,
  showId = true,
  empty,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: ReactNode;
  checks?: ReviewCheckItem[];
  showId?: boolean;
  empty?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children?: ReactNode;
}) {
  let content: ReactNode;

  if (children !== undefined) {
    content = children;
  } else if (checks !== undefined) {
    if (checks.length === 0 && empty) {
      content = empty;
    } else if (checks.length === 0) {
      return null;
    } else {
      content = <ReviewSectionList checks={checks} showId={showId} />;
    }
  } else {
    return null;
  }

  return (
    <ReviewSectionShell
      id={id}
      title={title}
      collapsible={collapsible}
      defaultOpen={defaultOpen}
    >
      {content}
    </ReviewSectionShell>
  );
}
