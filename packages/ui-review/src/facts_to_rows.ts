import type { JsonValue, ReviewCheckKind } from "@beforesign/core";

const FACT_LABELS: Record<string, string> = {
  primaryType: "Primary type",
  domainHash: "Domain hash",
  structHash: "Struct hash",
  signableHash: "Signable hash",
  scenarioId: "Scenario",
  tokenSymbol: "Token symbol",
  tokenDecimals: "Token decimals",
  hash: "Hash",
  discoveryStatus: "Discovery status",
  selector: "Selector",
  functionName: "Function name",
  hasCalldata: "Has calldata",
  missingFields: "Missing fields",
};

const HASH_KEYS = new Set(["domainHash", "structHash", "signableHash", "hash"]);
const ETHEREUM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const HASH_PATTERN = /^0x[a-fA-F0-9]+$/;

export type FactRow = {
  id: string;
  label: string;
  value: string;
  displayValue: string;
  kind: ReviewCheckKind;
};

function factLabel(key: string): string {
  if (FACT_LABELS[key]) return FACT_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function isStringArray(value: JsonValue[]): boolean {
  return value.every((item) => typeof item === "string");
}

function rawValueString(value: JsonValue): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function formatFactValue(_key: string, value: JsonValue): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value.trim() === "" ? "—" : value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (isStringArray(value)) return value.join(", ");
    return JSON.stringify(value);
  }
  return JSON.stringify(value);
}

export function inferFactKind(key: string, value: JsonValue): ReviewCheckKind {
  if (typeof value === "boolean") return "bool";
  if (key === "selector") return "selector";
  if (HASH_KEYS.has(key)) return "hash";
  if (typeof value === "string") {
    if (ETHEREUM_ADDRESS.test(value)) return "address";
    if (HASH_PATTERN.test(value) && value.length > 42) return "hash";
  }
  return "text";
}

export function factsToRows(facts: Record<string, JsonValue>): FactRow[] {
  return Object.entries(facts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      id: `facts.${key}`,
      label: factLabel(key),
      value: rawValueString(value),
      displayValue: formatFactValue(key, value),
      kind: inferFactKind(key, value),
    }));
}
