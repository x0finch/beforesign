import type { CalldataArg, CalldataCall, CalldataOutput } from "@beforesign/calldata-parse";
import { ArgTreeView } from "./arg_tree_view.tsx";

function getNodeTitle(node: CalldataCall): string {
  if (node.functionName) return node.functionName;
  if (node.summary.startsWith("Unknown method")) return node.summary;
  return node.selector;
}

function ArgsTable({ args }: { args: CalldataArg[] }) {
  if (args.length === 0) {
    return <p className="text-sm text-muted-foreground">No decoded arguments</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-foreground/75 border-b border-border">
          <th className="py-1 pr-3 font-medium">Name</th>
          <th className="py-1 pr-3 font-medium">Type</th>
          <th className="py-1 font-medium">Value</th>
        </tr>
      </thead>
      <tbody>
        {args.map((arg) => (
          <tr key={`${arg.name}-${arg.type}-${arg.displayValue}`} className="border-b border-border/50">
            <td className="py-1.5 pr-3 font-mono text-xs">{arg.name || "—"}</td>
            <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">{arg.type}</td>
            <td className="py-1.5 font-mono text-xs break-all">{arg.displayValue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
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

export function ParsedCallCard({ node }: { node: CalldataCall }) {
  const hasNestedArgs = node.args.length > 0 && node.children.length === 0;

  return (
    <div className="rounded-lg border border-border p-3 space-y-2 bg-background/50">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-semibold text-sm">{getNodeTitle(node)}</span>
        {node.signatureWithNames ? (
          <span className="text-xs text-muted-foreground font-mono">{node.signatureWithNames}</span>
        ) : node.signature ? (
          <span className="text-xs text-muted-foreground font-mono">{node.signature}</span>
        ) : null}
      </div>

      {(node.target || node.operation) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {node.target ? (
            <>
              <dt className="text-foreground/75">Target</dt>
              <dd className="font-mono break-all">{node.target}</dd>
            </>
          ) : null}
          {node.operation ? (
            <>
              <dt className="text-foreground/75">Operation</dt>
              <dd className="font-mono">{node.operation}</dd>
            </>
          ) : null}
        </dl>
      )}

      {hasNestedArgs ? <ArgsTable args={node.args} /> : null}

      {node.args.length === 0 ? (
        <pre className="text-[10px] font-mono break-all whitespace-pre-wrap text-muted-foreground max-h-24 overflow-auto">
          {node.raw}
        </pre>
      ) : null}

      {node.outputs && node.outputs.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-foreground/75 mb-1">Outputs (ABI)</p>
          <OutputsList outputs={node.outputs} />
        </div>
      ) : null}

      {node.children.length > 0 ? <ArgTreeView node={node} /> : null}
    </div>
  );
}
