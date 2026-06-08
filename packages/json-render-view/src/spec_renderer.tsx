import { JSONUIProvider, Renderer } from "@json-render/react";
import { catalog, validateSpec, type Spec } from "@beforesign/json-render-catalog";
import type { ReactNode } from "react";
import { registry } from "./registry.tsx";

export function SpecRenderer({
  spec,
  children,
}: {
  spec: Spec | null;
  children?: ReactNode;
}) {
  if (!spec) return null;

  const validation = catalog.validate(spec);
  if (!validation.success) {
    return (
      <div role="alert" className="alert-destructive text-sm">
        Invalid spec: {validation.error?.message ?? "Unknown validation error"}
      </div>
    );
  }

  const structural = validateSpec(spec);
  if (!structural.valid) {
    return (
      <div role="alert" className="alert-warning text-sm">
        Spec structure issues: {structural.issues.length} issue(s)
      </div>
    );
  }

  return (
    <JSONUIProvider registry={registry} initialState={{}}>
      <Renderer spec={spec} registry={registry} />
      {children}
    </JSONUIProvider>
  );
}
