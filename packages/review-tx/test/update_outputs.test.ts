import type { ClientsBundle } from "@beforesign/clients";
import type { ReviewDocument } from "@beforesign/core";
import { detectInputType } from "@beforesign/detect";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, vi } from "vitest";
import { buildReview } from "../src/build_review.ts";
import { FIXTURE_FILE_BY_NAME, REVIEW_FIXTURE_CASES } from "./fixtures/index.ts";
import type { ReviewFixture } from "./fixtures/types.ts";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

const OUTPUT_BLOCK_RE =
  /\/\/ @generated output[^\n]*\nconst output = [\s\S]*? satisfies ReviewDocument;/;

function mockClients(): ClientsBundle {
  return {
    txLookup: { searchQuick: vi.fn(), getTransaction: vi.fn() },
    etherscan: { getTransaction: vi.fn(), getTokenInfo: vi.fn() },
    debank: { preExecTx: vi.fn(), explainTx: vi.fn() },
  };
}

function formatOutputBlock(doc: ReviewDocument): string {
  const body = JSON.stringify(doc, null, 2);
  return `// @generated output — fixtures:update 维护，勿手改\nconst output = ${body} satisfies ReviewDocument;`;
}

async function writeFixtureOutput(fixture: ReviewFixture): Promise<void> {
  const fileName = FIXTURE_FILE_BY_NAME[fixture.name];
  if (!fileName) {
    throw new Error(`missing fixture file mapping for ${fixture.name}`);
  }
  const filePath = join(fixturesDir, fileName);
  const content = readFileSync(filePath, "utf8");
  const detected = detectInputType(fixture.input);
  if (detected.kind !== fixture.kind) {
    throw new Error(`fixture ${fixture.name}: expected ${fixture.kind}, got ${detected.kind}`);
  }
  if (detected.kind !== "signedTx" && detected.kind !== "unsignedTx") {
    throw new Error(`fixture ${fixture.name}: unsupported kind`);
  }
  const doc = await buildReview(detected.normalized, mockClients(), fixture.payload);
  const next = content.replace(OUTPUT_BLOCK_RE, formatOutputBlock(doc));
  if (next === content) {
    return;
  }
  writeFileSync(filePath, next);
}

describe.runIf(process.env.UPDATE_REVIEW_FIXTURES)("update fixture outputs", () => {
  it("writes ReviewDocument output into each fixture file", async () => {
    for (const fixture of REVIEW_FIXTURE_CASES) {
      await writeFixtureOutput(fixture);
    }
  });
});
