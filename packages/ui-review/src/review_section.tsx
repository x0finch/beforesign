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

export function ReviewAccordionSection({
  id,
  title,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
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

export function ReviewSectionBlock({
  id,
  title,
  children,
}: {
  id: string;
  title: ReactNode;
  children: ReactNode;
}) {
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
}: {
  id: string;
  title: string;
  checks: ReviewCheckItem[];
  showId?: boolean;
  empty?: ReactNode;
}) {
  if (checks.length === 0 && empty) {
    return (
      <ReviewSectionBlock id={id} title={title}>
        {empty}
      </ReviewSectionBlock>
    );
  }

  if (checks.length === 0) return null;

  return (
    <ReviewSectionBlock id={id} title={title}>
      <ReviewSectionList checks={checks} showId={showId} />
    </ReviewSectionBlock>
  );
}
