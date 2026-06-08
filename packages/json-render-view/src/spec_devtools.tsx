import { useEffect, useState, type ComponentType } from "react";
import type { Spec } from "@beforesign/json-render-catalog";
import { catalog } from "@beforesign/json-render-catalog";

type JsonRenderDevtoolsProps = {
  spec?: Spec | null;
  catalog?: typeof catalog;
};

export function SpecDevtools({ spec }: { spec: Spec | null }) {
  const [Devtools, setDevtools] = useState<ComponentType<JsonRenderDevtoolsProps> | null>(
    null,
  );

  useEffect(() => {
    void import("@json-render/devtools-react").then((mod) => {
      setDevtools(() => mod.JsonRenderDevtools as ComponentType<JsonRenderDevtoolsProps>);
    });
  }, []);

  if (!Devtools || !spec) return null;

  return <Devtools spec={spec} catalog={catalog} />;
}
