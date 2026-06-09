export function omitNullishProps(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      out[key] = value.map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return omitNullishProps(item as Record<string, unknown>);
        }
        return item;
      });
      continue;
    }

    out[key] = value;
  }

  return out;
}
