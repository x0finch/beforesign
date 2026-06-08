import { defineRegistry, type ComponentFn } from "@json-render/react";
import { catalog, type Catalog } from "@beforesign/json-render-catalog";
import { Badge as UiBadge } from "@beforesign/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@beforesign/ui/card";
import {
  FrameDescription,
  FrameHeader,
  FrameTitle,
} from "@beforesign/ui/frame";
import { Alert, AlertDescription, AlertTitle } from "@beforesign/ui/alert";
import { Separator } from "@beforesign/ui/separator";
import { cn } from "@beforesign/ui/utils";
import { AccordionBlock } from "./components/accordion_block.tsx";
import { FieldRow } from "./components/field_row.tsx";

const gapClassMap = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
} as const;

const CardComponent: ComponentFn<Catalog, "Card"> = ({ props, children }) => (
  <Card>
    <CardHeader>
      <CardTitle>{props.title}</CardTitle>
      {props.description ? <CardDescription>{props.description}</CardDescription> : null}
      {props.badge ? (
        <CardAction>
          <UiBadge variant="outline" className="capitalize">
            {props.badge}
          </UiBadge>
        </CardAction>
      ) : null}
    </CardHeader>
    {children ? <CardPanel>{children}</CardPanel> : null}
  </Card>
);

const StackComponent: ComponentFn<Catalog, "Stack"> = ({ props, children }) => (
  <div className={cn("flex flex-col", gapClassMap[props.gap ?? "md"])}>{children}</div>
);

const SectionComponent: ComponentFn<Catalog, "Section"> = ({ props, children }) => (
  <section className="flex flex-col gap-3">
    <FrameHeader className="p-0">
      <FrameTitle className="text-lg">{props.title}</FrameTitle>
      {props.description ? <FrameDescription>{props.description}</FrameDescription> : null}
    </FrameHeader>
    <div className="flex flex-col gap-3">{children}</div>
  </section>
);

const AccordionComponent: ComponentFn<Catalog, "Accordion"> = ({ props, children }) => (
  <AccordionBlock props={props}>{children}</AccordionBlock>
);

const TextComponent: ComponentFn<Catalog, "Text"> = ({ props }) => {
  if (props.variant === "caption") {
    return <FrameDescription className="text-xs">{props.content}</FrameDescription>;
  }

  if (props.variant === "mono") {
    return <p className="font-mono text-xs">{props.content}</p>;
  }

  return <p className="text-sm">{props.content}</p>;
};

const FieldComponent: ComponentFn<Catalog, "Field"> = ({ props }) => <FieldRow props={props} />;

const alertVariantMap = {
  info: "info",
  warning: "warning",
  destructive: "error",
} as const;

const AlertListComponent: ComponentFn<Catalog, "AlertList"> = ({ props }) => (
  <div className="flex flex-col gap-2">
    {props.items.map((item) => (
      <Alert key={`${item.code ?? item.severity}-${item.message}`} variant={alertVariantMap[item.severity]}>
        {item.code ? <AlertTitle>{item.code}</AlertTitle> : null}
        <AlertDescription>{item.message}</AlertDescription>
      </Alert>
    ))}
  </div>
);

const BadgeComponent: ComponentFn<Catalog, "Badge"> = ({ props }) => (
  <UiBadge variant={props.variant ?? "default"} className="self-start">
    {props.label}
  </UiBadge>
);

const DividerComponent: ComponentFn<Catalog, "Divider"> = () => <Separator />;

export const { registry } = defineRegistry(catalog, {
  components: {
    Card: CardComponent,
    Stack: StackComponent,
    Section: SectionComponent,
    Accordion: AccordionComponent,
    Text: TextComponent,
    Field: FieldComponent,
    AlertList: AlertListComponent,
    Badge: BadgeComponent,
    Divider: DividerComponent,
  },
});
