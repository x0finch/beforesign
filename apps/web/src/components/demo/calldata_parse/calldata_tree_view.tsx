import type { CalldataCall, CalldataOutput } from "@beforesign/calldata-parse";
import { ArgTreeView } from "./arg_tree_view.tsx";

function getNodeTitle(node: CalldataCall): string {
  if (node.functionName) return node.functionName;
  if (node.summary.startsWith("Unknown method")) return node.summary;
  return node.selector;
}

function shouldShowSummary(node: CalldataCall): boolean {
  if (!node.functionName) return false;
  if (node.summary === `Call ${node.functionName}`) return false;
  return true;
}

function OutputsList({ outputs }: { outputs: CalldataOutput[] }) {
  return (
    <ul className="text-sm space-y-1">
      {outputs.map((output) => (
        <li key={`${output.name}-${output.type}`} className="font-mono text-xs text-muted-foreground">
          {output.name ? `${output.name}: ` : ""}
          {output.type}
        </li>
      ))}
    </ul>
  );
}

export function CalldataTreeView({ node }: { node: CalldataCall }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border p-3 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold">{getNodeTitle(node)}</span>
          {node.signatureWithNames ? (
            <span className="text-xs text-muted-foreground font-mono">{node.signatureWithNames}</span>
          ) : node.signature ? (
            <span className="text-xs text-muted-foreground font-mono">{node.signature}</span>
          ) : null}
        </div>

        {shouldShowSummary(node) ? (
          <p className="text-sm text-muted-foreground">{node.summary}</p>
        ) : null}

        {node.outputs && node.outputs.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-foreground/75 mb-1">Outputs (ABI)</p>
            <OutputsList outputs={node.outputs} />
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="text-xs font-medium text-foreground/75 mb-3">Arguments</p>
        <ArgTreeView node={node} />
      </div>
    </div>
  );
}
