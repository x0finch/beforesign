import type { ParseResult, ViewSpec } from "@beforesign/core";

type SpecElement = {
  type?: string;
  props?: Record<string, unknown>;
};

function formatFieldValueForFacts(label: string, value: string): string {
  if (label === "Data" && value.startsWith("0x") && value.length > 66) {
    const byteLen = (value.length - 2) / 2;
    return `${value.slice(0, 66)}… (${byteLen} bytes, truncated)`;
  }
  return value;
}

export function summarizeViewSpec(spec: ViewSpec): string {
  const lines: string[] = [];

  for (const element of Object.values(spec.elements)) {
    if (!element || typeof element !== "object") continue;
    const typed = element as SpecElement;
    const props = typed.props;
    if (!props) continue;

    if (typed.type === "Field") {
      const label = String(props.label ?? "");
      const rawValue = String(props.displayValue ?? props.value ?? "");
      const value = formatFieldValueForFacts(label, rawValue);
      if (label) lines.push(`${label}: ${value}`);
      continue;
    }

    if (typed.type === "Card") {
      const title = String(props.title ?? "");
      const description = props.description ? String(props.description) : "";
      if (title) {
        lines.push(description ? `[Card] ${title} — ${description}` : `[Card] ${title}`);
      }
      continue;
    }

    if (typed.type === "Section") {
      const title = String(props.title ?? "");
      if (title) lines.push(`[Section] ${title}`);
      continue;
    }

    if (typed.type === "Text" && props.content) {
      lines.push(String(props.content));
    }
  }

  return lines.length > 0 ? lines.join("\n") : "(no labeled fields in spec)";
}

export function buildFactsContext(result: ParseResult | undefined): string {
  if (!result) return "No parse result available.";

  const lines: string[] = [
    `kind: ${result.kind}`,
    `summary: ${result.summary}`,
  ];

  if (result.view?.scenarioId) {
    lines.push(`scenarioId: ${result.view.scenarioId}`);
  }
  if (result.view?.title) {
    lines.push(`viewTitle: ${result.view.title}`);
  }
  if (result.view?.chainId !== undefined) {
    lines.push(`chainId: ${result.view.chainId}`);
  }
  if (result.view?.discovery) {
    lines.push(`discovery: ${JSON.stringify(result.view.discovery)}`);
  }

  if (result.warnings.length > 0) {
    lines.push("warnings:");
    for (const w of result.warnings) {
      lines.push(`  - [${w.severity}] ${w.code}: ${w.message}`);
    }
  }

  if (result.view?.spec) {
    lines.push("reviewFields:");
    lines.push(summarizeViewSpec(result.view.spec));
  }

  return lines.join("\n");
}

export function summarizeAssistantSpec(spec: ViewSpec): string {
  return summarizeViewSpec(spec);
}

export function getParseFacts(result: ParseResult | undefined, path?: string): string {
  if (!result) return "";
  if (!path?.trim()) return buildFactsContext(result);

  const trimmed = path.trim();
  if (trimmed === "summary") return result.summary;
  if (trimmed === "warnings") return JSON.stringify(result.warnings, null, 2);
  if (trimmed === "view.summary") return result.view?.summary ?? "";
  if (trimmed === "view.spec" || trimmed === "reviewFields") {
    return result.view?.spec ? summarizeViewSpec(result.view.spec) : "";
  }
  if (trimmed === "discovery") {
    return result.view?.discovery ? JSON.stringify(result.view.discovery, null, 2) : "";
  }

  return buildFactsContext(result);
}
