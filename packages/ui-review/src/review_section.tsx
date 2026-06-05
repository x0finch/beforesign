import type { ReviewCheckItem } from "@beforesign/core";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@beforesign/ui/accordion";
import { cn } from "@beforesign/ui/utils";
import type { ReactNode } from "react";
import {
  ReviewSectionItem,
  type ReviewSectionItemLayout,
} from "./review_section_item.tsx";

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
          <AccordionTrigger className={cn(sectionTitleClass, "py-0")}>
            {title}
          </AccordionTrigger>
          <AccordionPanel className="pt-4">{children}</AccordionPanel>
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
  layout = "keyValue",
  showId = true,
}: {
  checks: ReviewCheckItem[];
  layout?: ReviewSectionItemLayout;
  showId?: boolean;
}) {
  return (
    <div data-slot="review-section-list" className="flex flex-col">
      {checks.map((check) => (
        <ReviewSectionItem
          key={check.id}
          check={check}
          layout={layout}
          showId={showId}
        />
      ))}
    </div>
  );
}

export function ReviewSection({
  id,
  title,
  checks,
  layout = "keyValue",
  showId = true,
  empty,
}: {
  id: string;
  title: string;
  checks: ReviewCheckItem[];
  layout?: ReviewSectionItemLayout;
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
      <ReviewSectionList checks={checks} layout={layout} showId={showId} />
    </ReviewSectionBlock>
  );
}
