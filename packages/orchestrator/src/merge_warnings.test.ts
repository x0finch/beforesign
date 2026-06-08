import { describe, expect, it } from "vitest";
import { mergeWarnings } from "./merge_warnings.ts";

describe("mergeWarnings", () => {
  it("dedupes by warning code", () => {
    const merged = mergeWarnings(
      [{ code: "a", severity: "info", message: "1" }],
      [
        { code: "a", severity: "warning", message: "dup" },
        { code: "b", severity: "warning", message: "2" },
      ],
    );
    expect(merged).toHaveLength(2);
    expect(merged.map((w) => w.code)).toEqual(["a", "b"]);
  });
});
