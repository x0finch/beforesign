import * as React from "react";
import type { CalldataCall } from "@beforesign/calldata-parse";
import { serializeTree } from "~/demo/calldata_parse/serialize_tree.ts";
import { CalldataTreeView } from "./calldata_tree_view.tsx";

export function AfterPanel({
  loading,
  error,
  tree,
}: {
  loading: boolean;
  error: string | null;
  tree: CalldataCall | null;
}) {
  const [showJson, setShowJson] = React.useState(false);

  return (
    <div className="card space-y-4 h-full">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/80">After parse</h2>
        {tree ? (
          <button
            type="button"
            className="btn-ghost text-xs py-1 px-2"
            onClick={() => setShowJson((value) => !value)}
          >
            {showJson ? "Hide JSON" : "Show JSON"}
          </button>
        ) : null}
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Parsing…</p> : null}

      {error ? (
        <div role="alert" className="alert-destructive text-sm">
          {error}
        </div>
      ) : null}

      {!loading && !error && tree ? (
        <>
          {showJson ? (
            <pre className="text-xs font-mono break-all whitespace-pre-wrap rounded-lg border border-border p-3 max-h-96 overflow-auto bg-background">
              {JSON.stringify(serializeTree(tree), null, 2)}
            </pre>
          ) : (
            <CalldataTreeView node={tree} />
          )}
        </>
      ) : null}

      {!loading && !error && !tree ? (
        <p className="text-sm text-muted-foreground">Select a fixture to parse calldata.</p>
      ) : null}
    </div>
  );
}
