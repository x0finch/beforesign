import { Card, CardPanel } from "@beforesign/ui/card";
import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 text-sm font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 text-sm font-medium">{children}</h3>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code className={`block font-mono text-xs ${className ?? ""}`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-background/80 px-1 py-0.5 font-mono text-xs break-all"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-md bg-background/80 p-2 font-mono text-xs">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-border" />,
};

export function AiAssistantTextMessage({ content }: { content: string }) {
  return (
    <div className="max-w-[95%]">
      <Card className="border-border bg-muted/30 text-card-foreground shadow-xs/5">
        <CardPanel className="p-3 text-sm">
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </Markdown>
        </CardPanel>
      </Card>
    </div>
  );
}
