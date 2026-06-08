export function findBigIntPaths(value: unknown, path = ""): string[] {
  if (typeof value === "bigint") return [path || "(root)"];
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findBigIntPaths(item, `${path}[${index}]`));
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      findBigIntPaths(child, path ? `${path}.${key}` : key),
    );
  }
  return [];
}
