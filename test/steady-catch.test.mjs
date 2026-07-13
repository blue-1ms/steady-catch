import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { mkdtempSync } from "node:fs";

import {
  FILE_MARKER,
  MANAGED_END,
  MANAGED_START,
  addPhrase,
  destinationForTarget,
  doctor,
  installRules,
  listPhrases,
  mergeManagedBlock,
  parseRuleArgs,
  removePhrase,
  removeRules,
  renderForTarget,
  renderLegacyRule,
} from "../scripts/lib/steady-catch-core.mjs";

function fixture() {
  const root = mkdtempSync(resolve(tmpdir(), "steady-catch-test-"));
  const home = resolve(root, "home");
  mkdirSync(home, { recursive: true });
  return { home, root, os: "darwin" };
}

function options(overrides = {}) {
  const paths = fixture();
  return {
    activation: "on-request",
    all: false,
    dryRun: false,
    force: false,
    global: false,
    json: false,
    lang: "auto",
    mode: "classic",
    targets: ["codex"],
    ...paths,
    ...overrides,
  };
}

test("parses aliases, activation, and global target constraints", () => {
  const parsed = parseRuleArgs([
    "--target",
    "claude-code,github-copilot",
    "--mode=max",
    "--activation",
    "always",
  ]);
  assert.deepEqual(parsed.targets, ["claude", "copilot"]);
  assert.equal(parsed.mode, "max");
  assert.equal(parsed.activation, "always");
  assert.throws(
    () => parseRuleArgs(["--global", "--target", "cursor"]),
    /No reliable file-based global rules/,
  );
  assert.throws(() => parseRuleArgs(["--activation", "sometimes"]), /Invalid --activation/);

  const doctorSelection = parseRuleArgs(["--target", "cursor"], { defaultAll: true });
  assert.deepEqual(doctorSelection.targets, ["cursor"]);
  const doctorDefault = parseRuleArgs([], { defaultAll: true });
  assert.equal(doctorDefault.targets.length, 8);
});

test("uses current project and global target paths", () => {
  const project = options();
  assert.equal(destinationForTarget("claude", project).label, ".claude/rules/steady-catch.md");
  assert.equal(destinationForTarget("windsurf", project).label, ".windsurf/rules/steady-catch.md");

  const global = { ...project, global: true };
  assert.equal(destinationForTarget("codex", global).label, "~/.codex/AGENTS.md");
  assert.equal(destinationForTarget("copilot", global).label, "~/.copilot/copilot-instructions.md");
  assert.equal(destinationForTarget("cline", global).label, "~/Documents/Cline/Rules/steady-catch.md");
});

test("renders target-specific activation metadata", () => {
  const onRequest = options({ targets: ["cursor"] });
  const always = { ...onRequest, activation: "always" };

  assert.match(renderForTarget("cursor", onRequest), /alwaysApply: false/);
  assert.match(renderForTarget("cursor", always), /alwaysApply: true/);
  assert.match(renderForTarget("windsurf", onRequest), /trigger: model_decision/);
  assert.match(renderForTarget("windsurf", always), /trigger: always_on/);
  assert.match(renderForTarget("continue", onRequest), /alwaysApply: false/);
  assert.match(renderForTarget("claude", onRequest), new RegExp(FILE_MARKER));
  assert.doesNotMatch(renderForTarget("codex", onRequest), new RegExp(FILE_MARKER));
});

test("managed blocks preserve user content and update idempotently", () => {
  const block = `${MANAGED_START}\nnew rule\n${MANAGED_END}\n`;
  const first = mergeManagedBlock("# User rules\n", block);
  assert.match(first, /^# User rules/);
  assert.match(first, /new rule/);
  const second = mergeManagedBlock(first, block);
  assert.equal(second, first);

  const updated = mergeManagedBlock(first, `${MANAGED_START}\nupdated\n${MANAGED_END}\n`);
  assert.match(updated, /# User rules/);
  assert.match(updated, /updated/);
  assert.doesNotMatch(updated, /new rule/);

  const repaired = mergeManagedBlock(`# User rules\n${MANAGED_END}\n`, block, { force: true });
  assert.match(repaired, /# User rules/);
  assert.equal(repaired.match(new RegExp(MANAGED_START, "g"))?.length, 1);
  assert.equal(repaired.match(new RegExp(MANAGED_END, "g"))?.length, 1);
});

test("installs shared and dedicated rules without overwriting unrelated content", () => {
  const config = options({ targets: ["codex", "cursor"] });
  writeFileSync(resolve(config.root, "AGENTS.md"), "# Existing project rules\n", "utf8");

  const first = installRules(config);
  assert.deepEqual(first.map((result) => result.action), ["merged", "created"]);
  assert.match(readFileSync(resolve(config.root, "AGENTS.md"), "utf8"), /Existing project rules/);
  assert.match(readFileSync(resolve(config.root, ".cursor/rules/steady-catch.mdc"), "utf8"), /alwaysApply: false/);

  const second = installRules(config);
  assert.deepEqual(second.map((result) => result.action), ["unchanged", "unchanged"]);
});

test("refuses conflicting dedicated files unless force is explicit", () => {
  const config = options({ targets: ["cursor"] });
  const path = resolve(config.root, ".cursor/rules/steady-catch.mdc");
  mkdirSync(resolve(config.root, ".cursor/rules"), { recursive: true });
  writeFileSync(path, "user-owned content\n", "utf8");

  assert.throws(() => installRules(config), /not managed by steady-catch/);
  installRules({ ...config, force: true });
  assert.match(readFileSync(path, "utf8"), new RegExp(FILE_MARKER));
});

test("uninstall removes only managed content and deletes owned dedicated files", () => {
  const config = options({ targets: ["codex", "cursor"] });
  writeFileSync(resolve(config.root, "AGENTS.md"), "# Keep me\n", "utf8");
  installRules(config);
  const results = removeRules(config);

  assert.deepEqual(results.map((result) => result.action), ["removed", "removed"]);
  assert.equal(readFileSync(resolve(config.root, "AGENTS.md"), "utf8"), "# Keep me\n");
  assert.equal(existsSync(resolve(config.root, ".cursor/rules/steady-catch.mdc")), false);
});

test("migrates exact v0.1 Claude and Windsurf files", () => {
  const config = options({ targets: ["claude", "windsurf"] });
  const legacy = renderLegacyRule({ mode: "max", lang: "auto" });
  writeFileSync(resolve(config.root, "CLAUDE.md"), legacy, "utf8");
  writeFileSync(resolve(config.root, ".windsurfrules"), legacy, "utf8");

  const results = installRules(config);
  assert.equal(results.filter((result) => result.action === "migrated").length, 2);
  assert.equal(existsSync(resolve(config.root, "CLAUDE.md")), false);
  assert.equal(existsSync(resolve(config.root, ".windsurfrules")), false);
  assert.equal(existsSync(resolve(config.root, ".claude/rules/steady-catch.md")), true);
  assert.equal(existsSync(resolve(config.root, ".windsurf/rules/steady-catch.md")), true);
});

test("migrates exact v0.1 files that remain at the same target path", () => {
  const config = options({ targets: ["codex", "cursor"] });
  const legacy = renderLegacyRule({ mode: "classic", lang: "auto" });
  const oldCursor = `---\ndescription: "Steady Catch Mode: controlled AI catchphrase energy"\nalwaysApply: false\n---\n\n${legacy}`;
  const cursorPath = resolve(config.root, ".cursor/rules/steady-catch.mdc");
  mkdirSync(resolve(config.root, ".cursor/rules"), { recursive: true });
  writeFileSync(resolve(config.root, "AGENTS.md"), legacy, "utf8");
  writeFileSync(cursorPath, oldCursor, "utf8");

  const results = installRules(config);
  assert.deepEqual(results.map((result) => result.action), ["migrated", "migrated"]);
  assert.match(readFileSync(resolve(config.root, "AGENTS.md"), "utf8"), new RegExp(MANAGED_START));
  assert.match(readFileSync(cursorPath, "utf8"), new RegExp(FILE_MARKER));
});

test("global Claude migration preserves unrelated user instructions", () => {
  const config = options({ global: true, targets: ["claude"] });
  const oldPath = resolve(config.home, ".claude/CLAUDE.md");
  const oldBlock = `${MANAGED_START}\n${renderLegacyRule({ mode: "max", lang: "auto" }).trim()}\n${MANAGED_END}\n`;
  mkdirSync(resolve(config.home, ".claude"), { recursive: true });
  writeFileSync(oldPath, `# Personal Claude rules\n\n${oldBlock}`, "utf8");

  const results = installRules(config);
  assert.deepEqual(results.map((result) => result.action), ["created", "migrated"]);
  assert.equal(readFileSync(oldPath, "utf8"), "# Personal Claude rules\n");
  assert.match(
    readFileSync(resolve(config.home, ".claude/rules/steady-catch.md"), "utf8"),
    new RegExp(FILE_MARKER),
  );
});

test("global doctor reports the unsupported v0.1 Continue path", () => {
  const config = options({ global: true, targets: ["codex"] });
  const oldContinue = resolve(config.home, ".continue/rules/steady-catch.md");
  mkdirSync(resolve(config.home, ".continue/rules"), { recursive: true });
  writeFileSync(oldContinue, renderLegacyRule({ mode: "classic", lang: "auto" }), "utf8");

  const statuses = doctor(config).map(({ target, status }) => `${target}:${status}`);
  assert.ok(statuses.includes("codex:missing"));
  assert.ok(statuses.includes("continue:legacy"));
});

test("doctor reports installed, missing, conflict, and legacy states", () => {
  const config = options({ targets: ["codex", "cursor", "claude"] });
  installRules({ ...config, targets: ["codex"] });
  const cursor = resolve(config.root, ".cursor/rules/steady-catch.mdc");
  mkdirSync(resolve(config.root, ".cursor/rules"), { recursive: true });
  writeFileSync(cursor, "custom\n", "utf8");
  writeFileSync(resolve(config.root, "CLAUDE.md"), renderLegacyRule({ mode: "classic", lang: "auto" }), "utf8");

  const statuses = doctor(config).map(({ target, status }) => `${target}:${status}`);
  assert.ok(statuses.includes("codex:ok"));
  assert.ok(statuses.includes("cursor:conflict"));
  assert.ok(statuses.includes("claude:missing"));
  assert.ok(statuses.includes("claude:legacy"));
});

test("phrase evolution creates, deduplicates, lists, and removes entries", () => {
  const config = options();
  const phraseOptions = {
    category: "max",
    dryRun: false,
    global: false,
    lang: "zh",
    now: new Date("2026-07-13T00:00:00Z"),
    phrase: "给力奥铁子",
    root: config.root,
  };

  assert.equal(addPhrase(phraseOptions).action, "added");
  assert.equal(addPhrase({ ...phraseOptions, phrase: "  给力奥铁子  " }).action, "duplicate");
  assert.deepEqual(listPhrases(phraseOptions).phrases, ["给力奥铁子"]);
  assert.equal(removePhrase(phraseOptions).action, "removed");
  assert.deepEqual(listPhrases(phraseOptions).phrases, []);
  assert.throws(() => addPhrase({ ...phraseOptions, phrase: "bad\nphrase" }), /one line/);
});
