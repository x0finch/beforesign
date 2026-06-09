import * as React from "react";
import type { AskMessage } from "~/hooks/use_ask.ts";
import type { Locale } from "~/lib/i18n.ts";
import { AiArtifactPanel } from "./ai_artifact_panel.tsx";
import { AiAssistantMessage } from "./ai_assistant_message.tsx";
import { AiAssistantTextMessage } from "./ai_assistant_text_message.tsx";
import { AiTimelineEntry } from "./ai_timeline_entry.tsx";
import { AiUserMessage } from "./ai_user_message.tsx";

export function AiMessageList({
  locale,
  messages,
  listRef,
  loading,
}: {
  locale: Locale;
  messages: AskMessage[];
  listRef?: React.RefObject<HTMLDivElement | null>;
  loading?: boolean;
}) {
  React.useEffect(() => {
    listRef?.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, listRef]);

  const lastTimelineIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.kind === "timeline") return i;
    }
    return -1;
  })();

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 min-h-0 py-2">
      {messages.map((msg, index) => {
        if (msg.kind === "user") {
          return <AiUserMessage key={msg.id} content={msg.content} />;
        }
        if (msg.kind === "timeline") {
          const isActive =
            loading &&
            index === lastTimelineIndex &&
            (msg.entry.kind === "thought" ||
              (msg.entry.kind === "tool" && msg.entry.status === "running"));
          return (
            <div key={msg.id} className="max-w-[95%] space-y-0.5 pl-1">
              <AiTimelineEntry locale={locale} entry={msg.entry} active={isActive} />
            </div>
          );
        }
        if (msg.kind === "assistant") {
          return <AiAssistantMessage key={msg.id} spec={msg.spec} />;
        }
        if (msg.kind === "assistant_text") {
          return <AiAssistantTextMessage key={msg.id} content={msg.content} />;
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
