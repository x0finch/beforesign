import * as React from "react";
import type { AskMessage } from "~/hooks/use_ask.ts";
import type { Locale } from "~/lib/i18n.ts";
import { AiActivityPanel } from "./ai_activity_panel.tsx";
import { AiArtifactPanel } from "./ai_artifact_panel.tsx";
import { AiAssistantMessage } from "./ai_assistant_message.tsx";
import { AiUserMessage } from "./ai_user_message.tsx";

export function AiMessageList({
  locale,
  messages,
  listRef,
  onToggleActivity,
}: {
  locale: Locale;
  messages: AskMessage[];
  listRef?: React.RefObject<HTMLDivElement | null>;
  onToggleActivity: (id: string) => void;
}) {
  React.useEffect(() => {
    listRef?.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, listRef]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 min-h-0 py-2">
      {messages.map((msg) => {
        if (msg.kind === "user") {
          return <AiUserMessage key={msg.id} content={msg.content} />;
        }
        if (msg.kind === "activity") {
          return (
            <AiActivityPanel
              key={msg.id}
              locale={locale}
              steps={msg.steps}
              collapsed={msg.collapsed}
              onToggle={() => onToggleActivity(msg.id)}
            />
          );
        }
        if (msg.kind === "assistant") {
          return <AiAssistantMessage key={msg.id} spec={msg.spec} />;
        }
        if (msg.kind === "artifact") {
          return (
            <AiArtifactPanel
              key={msg.id}
              id={`artifact-${msg.id}`}
              result={msg.result}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
