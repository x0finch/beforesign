import { Card, CardPanel } from "@beforesign/ui/card";

export function AiUserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <Card className="max-w-[85%] border-border bg-card text-card-foreground shadow-xs/5">
        <CardPanel className="p-3 font-mono text-xs sm:text-sm break-all whitespace-pre-wrap">
          {content}
        </CardPanel>
      </Card>
    </div>
  );
}
