import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  generateMetaLine,
  markerEnd,
  markerStart,
  parseFcConfig,
  parseFcMenuActions,
  replaceMarkedSection,
} from "../scripts/project-sync-core.mjs";

describe("replaceMarkedSection", () => {
  const id = "test-section";
  const content = `${markerStart(id)}\nold\n${markerEnd(id)}\n`;

  it("replaces body between markers", () => {
    const out = replaceMarkedSection(content, id, "new body");
    assert.match(out, /new body/);
    assert.doesNotMatch(out, /\nold\n/);
  });

  it("throws when markers are missing", () => {
    assert.throws(() => replaceMarkedSection("no markers", id, "x"), /Missing sync markers/);
  });
});

describe("parseFcConfig", () => {
  it("parses real config.js without error", () => {
    const root = join(fileURLToPath(new URL("..", import.meta.url)));
    const source = readFileSync(
      join(root, "behavior_packs", "floor_column_copy", "scripts", "config.js"),
      "utf8",
    );
    const i18n = readFileSync(
      join(root, "behavior_packs", "floor_column_copy", "scripts", "i18n.js"),
      "utf8",
    );
    const spec = parseFcConfig(source, i18n);
    assert.equal(spec.maxCopyHeight, 384);
    assert.equal(spec.items.copyWand, "floor_column_copy:copy_wand");
    assert.ok(spec.helpLines.length >= 1);
  });
});

describe("parseFcMenuActions", () => {
  it("parses menu labels from ui.js", () => {
    const root = join(fileURLToPath(new URL("..", import.meta.url)));
    const source = readFileSync(
      join(root, "behavior_packs", "floor_column_copy", "scripts", "ui.js"),
      "utf8",
    );
    const actions = parseFcMenuActions(source);
    assert.equal(actions.length, 6);
    assert.equal(actions[0].label, "1ブロック");
    assert.equal(actions[0].height, 1);
  });
});

describe("generateMetaLine", () => {
  it("includes repo and commit", () => {
    const line = generateMetaLine("hakonikomoru/floor-column-copy", "abc1234");
    assert.match(line, /floor-column-copy/);
    assert.match(line, /abc1234/);
  });
});
