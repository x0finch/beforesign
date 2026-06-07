function readSelector(input: string): string {
  return input.length >= 10 ? input.slice(0, 10) : input;
}

export function BeforePanel({
  label,
  description,
  input,
}: {
  label: string;
  description: string;
  input: string;
}) {
  const selector = readSelector(input);

  return (
    <div className="card space-y-4 h-full">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">Before parse</h2>
        <p className="text-lg font-medium mt-1">{label}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-foreground/75 mb-1">Selector</p>
        <code className="text-sm font-mono">{selector}</code>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs font-medium text-foreground/75">Raw calldata</p>
          <button
            type="button"
            className="btn-ghost text-xs py-1 px-2"
            onClick={() => void navigator.clipboard.writeText(input)}
          >
            Copy
          </button>
        </div>
        <pre className="text-xs font-mono break-all whitespace-pre-wrap rounded-lg border border-border p-3 max-h-80 overflow-auto bg-background">
          {input}
        </pre>
      </div>
    </div>
  );
}
