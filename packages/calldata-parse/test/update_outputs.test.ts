import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { parseCalldata } from "../src/parse_calldata.ts";
import { FIXTURE_FILE_BY_NAME, PARSE_FIXTURE_CASES } from "./fixtures/index.ts";
import type { ParseFixture } from "./fixtures/types.ts";
import { buildOptions, serializeTree } from "./helpers/serialize_tree.ts";
import type { SerializableCalldataCall } from "../src/types.ts";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

const OUTPUT_BLOCK_RE =
  /\/\/ @generated output[^\n]*\nconst output = [\s\S]*? satisfies SerializableCalldataCall;/;

function formatOutputBlock(output: SerializableCalldataCall): string {
  const body = JSON.stringify(output, null, 2);
  return `// @generated output — fixtures:update 维护，勿手改\nconst output = ${body} satisfies SerializableCalldataCall;`;
}

async function writeFixtureOutput(fixture: ParseFixture): Promise<void> {
  const fileName = FIXTURE_FILE_BY_NAME[fixture.name];
  if (!fileName) {
    throw new Error(`missing fixture file mapping for ${fixture.name}`);
  }
  const filePath = join(fixturesDir, fileName);
  const content = readFileSync(filePath, "utf8");
  const tree = await parseCalldata(fixture.input, buildOptions(fixture));
  const next = content.replace(OUTPUT_BLOCK_RE, formatOutputBlock(serializeTree(tree)));
  if (next === content) {
    throw new Error(`failed to update generated output block for ${fixture.name}`);
  }
  writeFileSync(filePath, next);
}

describe.runIf(process.env.UPDATE_PARSE_FIXTURES)("update fixture outputs", () => {
  it("writes CalldataCall output into each fixture file", async () => {
    for (const fixture of PARSE_FIXTURE_CASES) {
      await writeFixtureOutput(fixture);
    }
  });
});
