import type { ReviewCheckItem } from "@beforesign/core";
import type { GroupedChecks } from "./types.ts";

const SECTION_ORDER = ["domain", "message", "default", "transaction", "calldata", "signature"];

function sectionLabel(group: string): string | null {
  if (group === "default") return null;
  if (group === "domain") return "Domain";
  if (group === "message") return "Message";
  if (group === "transaction") return "Transaction";
  if (group === "calldata") return "Calldata";
  if (group === "signature") return "Signature";
  return group.charAt(0).toUpperCase() + group.slice(1);
}

export function groupChecksBySection(checks: ReviewCheckItem[]): GroupedChecks {
  const byGroup = new Map<string, ReviewCheckItem[]>();

  for (const check of checks) {
    const list = byGroup.get(check.group) ?? [];
    list.push(check);
    byGroup.set(check.group, list);
  }

  const orderedGroups = [
    ...SECTION_ORDER.filter((g) => byGroup.has(g)),
    ...[...byGroup.keys()].filter((g) => !SECTION_ORDER.includes(g)),
  ];

  const sections = orderedGroups.map((group) => ({
    id: group,
    label: sectionLabel(group),
    checks: byGroup.get(group) ?? [],
  }));

  return { sections };
}
