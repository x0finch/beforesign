import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@beforesign/ui/accordion";
import type { ReactNode } from "react";

const factsItemValue = "facts";

export function ReviewCollapsibleSection({
  title,
  children,
  defaultOpen = false,
  dataGroup,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  dataGroup?: string;
}) {
  return (
    <div data-group={dataGroup}>
      <Accordion defaultValue={defaultOpen ? [factsItemValue] : []}>
        <AccordionItem value={factsItemValue} className="border-0">
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionPanel>{children}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
