import type { AccordionProps } from "@beforesign/json-render-catalog";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@beforesign/ui/accordion";
import { cn } from "@beforesign/ui/utils";
import type { ReactNode } from "react";
import { useId } from "react";

export function AccordionBlock({
  props,
  children,
}: {
  props: AccordionProps;
  children?: ReactNode;
}) {
  const id = useId();
  const defaultExpanded = props.defaultExpanded ?? false;

  return (
    <Accordion defaultValue={defaultExpanded ? [id] : []}>
      <AccordionItem value={id} className="border-0">
        <AccordionTrigger className="items-start py-3">
          <span className="flex flex-col gap-0.5 text-left">
            <span>{props.title}</span>
            {props.description ? (
              <span className="font-normal text-muted-foreground text-xs">
                {props.description}
              </span>
            ) : null}
          </span>
        </AccordionTrigger>
        <AccordionPanel className={cn("flex flex-col gap-1 pt-0 pb-2 text-foreground")}>
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
