import type { ViewSpec } from "@beforesign/core";
import type { Spec } from "@beforesign/json-render-catalog";
import { SpecRenderer } from "@beforesign/json-render-view";

export function AiAssistantMessage({ spec }: { spec: ViewSpec }) {
  return (
    <div className="max-w-[95%]">
      <SpecRenderer spec={spec as unknown as Spec} />
    </div>
  );
}
