import type { ParseResult } from "@beforesign/core";
import type { Spec } from "@beforesign/json-render-catalog";
import { SpecRenderer } from "@beforesign/json-render-view";

export function AiArtifactPanel({
  result,
  id,
}: {
  result: ParseResult;
  id?: string;
}) {
  if (!result.view?.spec) return null;

  return (
    <div id={id}>
      <SpecRenderer spec={result.view.spec as unknown as Spec} />
    </div>
  );
}
