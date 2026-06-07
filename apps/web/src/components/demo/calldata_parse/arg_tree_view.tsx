import type { CalldataArg, CalldataArgComponent, CalldataCall } from "@beforesign/calldata-parse";
import {
  buildArgChildLinks,
  childLinkKey,
  formatSourcePathLabel,
} from "@beforesign/calldata-parse";
import { ParsedCallCard } from "./parsed_call_card.tsx";

function isTupleArrayType(type: string): boolean {
  return type.includes("tuple") && type.endsWith("[]");
}

function fieldDisplayValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "—";
  return JSON.stringify(value);
}

function ArgFieldRow({
  name,
  type,
  value,
  path,
}: {
  name: string;
  type: string;
  value: unknown;
  path: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(5rem,auto)_minmax(5rem,auto)_1fr] gap-x-3 gap-y-1 py-1.5 border-b border-border/50 text-xs">
      <span className="font-mono">{name || "—"}</span>
      <span className="font-mono text-muted-foreground">{type}</span>
      <span className="font-mono break-all">{fieldDisplayValue(value)}</span>
    </div>
  );
}

function LinkedChildBlock({
  parent,
  path,
  child,
}: {
  parent: CalldataCall;
  path: string;
  child: CalldataCall;
}) {
  const label = child.wrapper?.sourcePath
    ? formatSourcePathLabel(parent, child.wrapper.sourcePath)
    : path;

  return (
    <div className="mt-2 ml-3 border-l-2 border-border pl-3 space-y-1">
      <p className="text-xs text-muted-foreground">
        Parsed from <span className="font-mono text-foreground/80">{label}</span>
      </p>
      <ParsedCallCard node={child} />
    </div>
  );
}

function MultiSendEntries({
  parent,
  argPath,
}: {
  parent: CalldataCall;
  argPath: string;
}) {
  const entries = parent.children
    .filter(
      (child) =>
        child.wrapper?.kind === "safe.multiSend" && child.wrapper.sourcePath === argPath,
    )
    .sort((left, right) => (left.wrapper?.index ?? 0) - (right.wrapper?.index ?? 0));

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 ml-3 space-y-3">
      {entries.map((child) => (
        <div key={childLinkKey(argPath, child.wrapper)} className="border-l-2 border-border pl-3">
          <p className="text-xs font-medium text-foreground/75 mb-1">
            Packed entry [{child.wrapper?.index ?? 0}]
          </p>
          <ParsedCallCard node={child} />
        </div>
      ))}
    </div>
  );
}

function renderObjectFields(
  parent: CalldataCall,
  components: CalldataArgComponent[] | undefined,
  value: Record<string, unknown>,
  path: string,
  links: Map<string, CalldataCall>,
) {
  if (!components) return null;

  return components.map((component, index) => {
    const fieldPath = `${path}/${index}`;
    const fieldValue = value[component.name];
    const linked = links.get(fieldPath);

    return (
      <div key={fieldPath}>
        <ArgFieldRow
          name={component.name}
          type={component.type}
          value={fieldValue}
          path={fieldPath}
        />
        {linked ? <LinkedChildBlock parent={parent} path={fieldPath} child={linked} /> : null}
      </div>
    );
  });
}

function renderTupleArray(
  parent: CalldataCall,
  arg: CalldataArg,
  path: string,
  links: Map<string, CalldataCall>,
) {
  const items = Array.isArray(arg.value) ? arg.value : [];
  return (
    <div className="ml-3 space-y-2 border-l border-border/60 pl-3">
      {items.map((item, index) => {
        const itemPath = `${path}/${index}`;
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return (
            <div key={itemPath} className="space-y-1">
              <p className="text-xs font-medium text-foreground/75">[{index}]</p>
              {renderObjectFields(
                parent,
                arg.components,
                item as Record<string, unknown>,
                itemPath,
                links,
              )}
            </div>
          );
        }
        return (
          <ArgFieldRow
            key={itemPath}
            name={`[${index}]`}
            type={arg.type}
            value={item}
            path={itemPath}
          />
        );
      })}
    </div>
  );
}

function ArgNode({
  parent,
  arg,
  argIndex,
  links,
}: {
  parent: CalldataCall;
  arg: CalldataArg;
  argIndex: number;
  links: Map<string, CalldataCall>;
}) {
  const path = String(argIndex);
  const linked = links.get(path);
  const hasMultiSendEntries = parent.children.some(
    (child) => child.wrapper?.kind === "safe.multiSend" && child.wrapper.sourcePath === path,
  );

  if (isTupleArrayType(arg.type)) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground/80">
          {arg.name || "—"}{" "}
          <span className="font-mono text-muted-foreground font-normal">({arg.type})</span>
        </p>
        {renderTupleArray(parent, arg, path, links)}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <ArgFieldRow name={arg.name} type={arg.type} value={arg.value} path={path} />

      {hasMultiSendEntries ? <MultiSendEntries parent={parent} argPath={path} /> : null}

      {!hasMultiSendEntries && linked ? (
        <LinkedChildBlock parent={parent} path={path} child={linked} />
      ) : null}

      {Array.isArray(arg.value) && !isTupleArrayType(arg.type)
        ? arg.value.map((item, index) => {
            const itemPath = `${path}/${index}`;
            const itemLinked = links.get(itemPath);
            return (
              <div key={itemPath} className="ml-3">
                <ArgFieldRow name={`[${index}]`} type={arg.type} value={item} path={itemPath} />
                {itemLinked ? (
                  <LinkedChildBlock parent={parent} path={itemPath} child={itemLinked} />
                ) : null}
              </div>
            );
          })
        : null}
    </div>
  );
}

export function ArgTreeView({ node }: { node: CalldataCall }) {
  const links = buildArgChildLinks(node);

  if (node.args.length === 0) {
    return <p className="text-sm text-muted-foreground">No decoded arguments</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(5rem,auto)_minmax(5rem,auto)_1fr] gap-x-3 text-xs text-foreground/75 border-b border-border pb-1">
        <span className="font-medium">Name</span>
        <span className="font-medium">Type</span>
        <span className="font-medium">Value</span>
      </div>
      {node.args.map((arg, index) => (
        <ArgNode key={`${arg.name}-${index}`} parent={node} arg={arg} argIndex={index} links={links} />
      ))}
    </div>
  );
}
