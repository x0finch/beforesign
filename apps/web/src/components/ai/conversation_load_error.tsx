import type { ErrorComponentProps } from "@tanstack/react-router";

export function ConversationLoadError({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : "Failed to load conversation";

  return (
    <div role="alert" className="alert-destructive mt-4">
      {message}
    </div>
  );
}
