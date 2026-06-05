export function parseInputObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    throw new Error("Expected object input");
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Expected object input");
    }
    return parsed as Record<string, unknown>;
  } catch {
    return parseObjectLiteral(trimmed);
  }
}

function parseObjectLiteral(raw: string): Record<string, unknown> {
  try {
    const evaluated: unknown = new Function(`"use strict"; return (${raw});`)();
    if (typeof evaluated !== "object" || evaluated === null || Array.isArray(evaluated)) {
      throw new Error("Expected object input");
    }
    return evaluated as Record<string, unknown>;
  } catch {
    throw new Error("Invalid object input");
  }
}

export function normalizeRawInputToJson(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return undefined;
  try {
    const obj = parseInputObject(trimmed);
    return JSON.stringify(obj, null, 2);
  } catch {
    return undefined;
  }
}
