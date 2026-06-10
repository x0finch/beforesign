export function ConversationPending() {
  return (
    <div className="mt-4 space-y-3 animate-pulse" aria-busy="true" aria-label="Loading conversation">
      <div className="h-10 rounded-lg bg-muted max-w-[85%]" />
      <div className="h-24 rounded-lg bg-muted max-w-full" />
      <div className="h-8 rounded-lg bg-muted max-w-[70%] ml-auto" />
    </div>
  );
}
