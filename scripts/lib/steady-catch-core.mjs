import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, resolve } from "node:path";

export const VERSION = "0.2.0";
export const TARGET_NAMES = [
  "codex",
  "claude",
  "cursor",
  "copilot",
  "windsurf",
  "gemini",
  "cline",
  "continue",
];
export const GLOBAL_TARGET_NAMES = ["codex", "claude", "copilot", "windsurf", "gemini", "cline"];

export const MANAGED_START = "<!-- steady-catch:start -->";
export const MANAGED_END = "<!-- steady-catch:end -->";
export const FILE_MARKER = "<!-- steady-catch:generated -->";
export const PHRASE_BANK_MARKER = "<!-- steady-catch:phrase-bank-v1 -->";

const VALID_MODES = new Set(["light", "classic", "max"]);
const VALID_LANGS = new Set(["auto", "zh", "en", "bilingual"]);
const VALID_PHRASE_LANGS = new Set(["zh", "en", "bilingual"]);
const VALID_ACTIVATIONS = new Set(["on-request", "always"]);

const TARGET_ALIASES = {
  "claude-code": "claude",
  "github-copilot": "copilot",
  "gemini-cli": "gemini",
};

const PROJECT_TARGETS = {
  codex: { path: "AGENTS.md", shared: true },
  claude: { path: ".claude/rules/steady-catch.md", shared: false },
  cursor: { path: ".cursor/rules/steady-catch.mdc", shared: false },
  copilot: { path: ".github/copilot-instructions.md", shared: true },
  windsurf: { path: ".windsurf/rules/steady-catch.md", shared: false },
  gemini: { path: "GEMINI.md", shared: true },
  cline: { path: ".clinerules/steady-catch.md", shared: false },
  continue: { path: ".continue/rules/steady-catch.md", shared: false },
};

function globalTargets(home, os = platform()) {
  const clineRules = os === "win32"
    ? resolve(home, "Documents", "Cline", "Rules", "steady-catch.md")
    : resolve(home, "Documents", "Cline", "Rules", "steady-catch.md");

  return {
    codex: { path: resolve(home, ".codex", "AGENTS.md"), label: "~/.codex/AGENTS.md", shared: true },
    claude: {
      path: resolve(home, ".claude", "rules", "steady-catch.md"),
      label: "~/.claude/rules/steady-catch.md",
      shared: false,
    },
    copilot: {
      path: resolve(home, ".copilot", "copilot-instructions.md"),
      label: "~/.copilot/copilot-instructions.md",
      shared: true,
    },
    windsurf: {
      path: resolve(home, ".codeium", "windsurf", "memories", "global_rules.md"),
      label: "~/.codeium/windsurf/memories/global_rules.md",
      shared: true,
    },
    gemini: {
      path: resolve(home, ".gemini", "GEMINI.md"),
      label: "~/.gemini/GEMINI.md",
      shared: true,
    },
    cline: {
      path: clineRules,
      label: os === "win32"
        ? "%USERPROFILE%/Documents/Cline/Rules/steady-catch.md"
        : "~/Documents/Cline/Rules/steady-catch.md",
      shared: false,
    },
  };
}

function addTargets(options, rawTargets) {
  const names = rawTargets
    .split(",")
    .map((target) => target.trim())
    .filter(Boolean)
    .map((target) => TARGET_ALIASES[target] ?? target);

  if (names.includes("all")) {
    options.all = true;
    return;
  }

  options.targets.push(...names);
}

function optionValue(argv, index, arg) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
  return value;
}

export function parseRuleArgs(argv, { defaultAll = false } = {}) {
  const options = {
    activation: "on-request",
    all: false,
    dryRun: false,
    force: false,
    global: false,
    home: homedir(),
    json: false,
    lang: "auto",
    mode: "classic",
    os: platform(),
    root: process.cwd(),
    targets: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const readValue = () => {
      const value = optionValue(argv, i, arg);
      i += 1;
      return value;
    };

    if (arg === "--all") options.all = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--global") options.global = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--root") options.root = resolve(readValue());
    else if (arg.startsWith("--root=")) options.root = resolve(arg.slice("--root=".length));
    else if (arg === "--mode") options.mode = readValue();
    else if (arg.startsWith("--mode=")) options.mode = arg.slice("--mode=".length);
    else if (arg === "--lang") options.lang = readValue();
    else if (arg.startsWith("--lang=")) options.lang = arg.slice("--lang=".length);
    else if (arg === "--activation") options.activation = readValue();
    else if (arg.startsWith("--activation=")) options.activation = arg.slice("--activation=".length);
    else if (["--target", "--targets", "--ai", "--ais"].includes(arg)) addTargets(options, readValue());
    else if (arg.startsWith("--target=")) addTargets(options, arg.slice("--target=".length));
    else if (arg.startsWith("--targets=")) addTargets(options, arg.slice("--targets=".length));
    else if (arg.startsWith("--ai=")) addTargets(options, arg.slice("--ai=".length));
    else if (arg.startsWith("--ais=")) addTargets(options, arg.slice("--ais=".length));
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!VALID_MODES.has(options.mode)) {
    throw new Error(`Invalid --mode "${options.mode}". Use one of: ${[...VALID_MODES].join(", ")}`);
  }
  if (!VALID_LANGS.has(options.lang)) {
    throw new Error(`Invalid --lang "${options.lang}". Use one of: ${[...VALID_LANGS].join(", ")}`);
  }
  if (!VALID_ACTIVATIONS.has(options.activation)) {
    throw new Error(`Invalid --activation "${options.activation}". Use one of: on-request, always`);
  }

  const availableTargets = options.global ? GLOBAL_TARGET_NAMES : TARGET_NAMES;
  if (options.all) options.targets = availableTargets.slice();
  if (options.targets.length === 0) options.targets = defaultAll ? availableTargets.slice() : ["codex"];
  options.targets = [...new Set(options.targets)];

  const unknownTargets = options.targets.filter((target) => !TARGET_NAMES.includes(target));
  if (unknownTargets.length > 0) {
    throw new Error(`Unknown target(s): ${unknownTargets.join(", ")}. Use one of: ${TARGET_NAMES.join(", ")}`);
  }

  if (options.global) {
    const unsupported = options.targets.filter((target) => !GLOBAL_TARGET_NAMES.includes(target));
    if (unsupported.length > 0) {
      throw new Error(
        `No reliable file-based global rules are available for: ${unsupported.join(", ")}. ` +
        `Use npx skills add -g or a project rule instead. Global rule targets: ${GLOBAL_TARGET_NAMES.join(", ")}`,
      );
    }
  }

  return options;
}

export function destinationForTarget(target, options) {
  if (options.global) {
    const config = globalTargets(options.home, options.os)[target];
    return { ...config, target };
  }

  const config = PROJECT_TARGETS[target];
  return {
    ...config,
    label: config.path,
    path: resolve(options.root, config.path),
    target,
  };
}

function activationInstruction(activation) {
  if (activation === "always") {
    return "Apply this style to normal eligible responses without requiring the user to name it. Safety downgrades still override the style.";
  }
  return "Use this rule only when the user asks for steady-catch voice, 稳稳接住模式, 接住味, AI 味, cringe mode, synthetic warmth, or an intentionally over-empathetic assistant style.";
}

export function baseRule({ activation, lang, mode }) {
  return `# Steady Catch Mode

${activationInstruction(activation)}

Mode: ${mode}
Language: ${lang}
Activation: ${activation}

## Behavior

- Keep the actual work useful, correct, and specific.
- Put the useful answer first. Add controlled AI catchphrase energy around it, never instead of it.
- Preserve factual uncertainty. Never use warmth to hide missing verification.
- If tests, commands, screenshots, or sources were not checked, say so plainly.
- For Chinese, prefer phrases like "稳的", "我接住这个点", "先把它接稳", and locally saved phrases.
- For English, prefer phrases like "I've got you", "let me steady this first", and light parody of recognizable AI-writing tells.

## Self-Evolution

- Read \`.steady-catch/phrases.local.md\` before classic or max responses when it exists.
- Read \`~/.steady-catch/phrases.global.md\` as the user's global phrase bank when available.
- Phrase priority is project-local, then global, then bundled references.
- Save a phrase only after an explicit instruction such as "记住这个味", "以后多用这种", or "save this phrase".
- Never treat laughter, praise, or passive feedback alone as permission to write a phrase bank.
- Keep self-evolution silly and consensual; never store sensitive, private, targeted, or harmful material.

## Intensity

- light: one small flourish, then normal work.
- classic: warm acknowledgement, catchphrase, useful content, tiny closing flourish.
- max: obvious parody with extra 土味 while preserving the useful answer.

## Safety Downgrade

Use plain direct style for medical, legal, financial, self-harm, security, production incident, credential, or data-loss contexts unless the user explicitly asks for satire after the serious answer is handled.

## Avoid

- Do not claim "this is fully verified" unless it is.
- Do not end every answer with "if you want, I can..." unless parodying annoying AI follow-up hooks.
- Do not create emotional dependency language such as "I will always be here" or "you only need me".
`;
}

function frontmatterForTarget(target, activation) {
  if (target === "cursor") {
    return `---\ndescription: "Steady Catch Mode: controlled bilingual AI catchphrase parody"\nalwaysApply: ${activation === "always"}\n---`;
  }
  if (target === "windsurf") {
    return activation === "always"
      ? `---\ntrigger: always_on\n---`
      : `---\ntrigger: model_decision\ndescription: "Use when the user asks for steady-catch, cringe, AI flavor, or 稳稳接住 style"\n---`;
  }
  if (target === "continue") {
    return `---\nname: Steady Catch Mode\ndescription: Controlled bilingual AI catchphrase parody\nalwaysApply: ${activation === "always"}\n---`;
  }
  return "";
}

export function managedContent(content) {
  return `${MANAGED_START}\n${content.trim()}\n${MANAGED_END}\n`;
}

export function renderForTarget(target, options) {
  let rule = baseRule(options);
  if (target === "copilot") {
    rule += `\n## GitHub Copilot Note\n\nNormal code completion and review stay direct unless activation is always or the prompt explicitly requests the style.\n`;
  }

  const block = managedContent(rule);
  const destination = destinationForTarget(target, options);
  if (destination.shared) return block;

  const frontmatter = frontmatterForTarget(target, options.activation);
  return `${frontmatter ? `${frontmatter}\n\n` : ""}${FILE_MARKER}\n${block}`;
}

function markerState(content) {
  const start = content.indexOf(MANAGED_START);
  const end = content.indexOf(MANAGED_END);
  return { start, end, valid: start !== -1 && end > start, malformed: (start === -1) !== (end === -1) || end < start };
}

export function mergeManagedBlock(existing, block, { force = false } = {}) {
  const state = markerState(existing);
  if (state.malformed) {
    if (!force) throw new Error("Found malformed steady-catch managed markers; rerun with --force to repair them");
    const clean = existing
      .replaceAll(MANAGED_START, "")
      .replaceAll(MANAGED_END, "")
      .trimEnd();
    return `${clean}${clean.trim() ? "\n\n" : ""}${block}`;
  }
  if (state.valid) {
    const after = state.end + MANAGED_END.length;
    return `${existing.slice(0, state.start)}${block.trimEnd()}${existing.slice(after)}`.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  }
  const prefix = existing.trimEnd();
  return `${prefix}${prefix ? "\n\n" : ""}${block}`;
}

export function removeManagedBlock(existing) {
  const state = markerState(existing);
  if (state.malformed) throw new Error("Found malformed steady-catch managed markers; refusing to remove unrelated content");
  if (!state.valid) return { changed: false, content: existing };
  const after = state.end + MANAGED_END.length;
  const content = `${existing.slice(0, state.start)}${existing.slice(after)}`
    .replace(new RegExp(`^${FILE_MARKER}\\s*`, "m"), "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { changed: true, content: content ? `${content}\n` : "" };
}

export function renderLegacyRule({ lang, mode }) {
  return `# Steady Catch Mode

Use this rule only when the user asks for steady-catch voice, 稳稳接住模式, 接住味, AI 味, cringe mode, synthetic warmth, or an intentionally over-empathetic assistant style.

Mode: ${mode}
Language: ${lang}

## Behavior

- Keep the actual work useful, correct, and specific.
- Add controlled AI catchphrase energy around the answer, not instead of the answer.
- Preserve factual uncertainty. Never use warmth to hide missing verification.
- If tests, commands, screenshots, or sources were not checked, say so plainly.
- For Chinese, prefer phrases like "稳的", "我接住这个点", and "先把它接稳".
- For English, prefer phrases like "I've got you", "let me steady this first", and light parody of AI-writing tells.

## Self-Evolution

- If \`.steady-catch/phrases.local.md\` exists, read it before producing classic or max steady-catch style.
- If \`~/.steady-catch/phrases.global.md\` exists, treat it as the user's global phrase bank.
- When the user says "记住这个味", "这个更土", "以后多用这种", "save this phrase", or asks the style to evolve, treat the phrase as a candidate for \`.steady-catch/phrases.local.md\`.
- Only write local phrases when the user clearly opts in. Keep self-evolution silly and consensual, not sensitive or harmful.
- In max mode, prefer locally saved phrases and increasingly 土味 phrasing while keeping the useful answer intact.

## Intensity

- light: one small flourish, then normal work.
- classic: warm acknowledgement, catchphrase, useful content, tiny closing flourish.
- max: obvious parody for demos or screenshots, with extra 土味 when requested, while still preserving the useful answer.

## Safety Downgrade

Use plain direct style for medical, legal, financial, self-harm, security, production incident, credential, or data-loss contexts unless the user explicitly asks for satire after the serious answer is handled.

## Avoid

- Do not claim "this is fully verified" unless it is.
- Do not end every answer with "if you want, I can..." unless parodying annoying AI follow-up hooks.
- Do not create emotional dependency language such as "I will always be here" or "you only need me".
`;
}

export function isExactLegacyRule(content) {
  const mode = content.match(/^Mode: (light|classic|max)$/m)?.[1];
  const lang = content.match(/^Language: (auto|zh|en|bilingual)$/m)?.[1];
  if (!mode || !lang) return false;
  return content.trim() === renderLegacyRule({ mode, lang }).trim();
}

function isExactLegacyTarget(content, target) {
  const mode = content.match(/^Mode: (light|classic|max)$/m)?.[1];
  const lang = content.match(/^Language: (auto|zh|en|bilingual)$/m)?.[1];
  if (!mode || !lang) return false;
  const rule = renderLegacyRule({ mode, lang });
  let expected = rule;
  if (target === "cursor") {
    expected = `---\ndescription: "Steady Catch Mode: controlled AI catchphrase energy"\nalwaysApply: false\n---\n\n${rule}`;
  } else if (target === "copilot") {
    expected = `${rule}\n## GitHub Copilot Note\n\nApply this only when the prompt asks for the style. Normal code completions and reviews should stay direct.\n`;
  }
  return content.trim() === expected.trim();
}

function legacyLocations(target, options) {
  if (!options.global && target === "claude") {
    return [{ path: resolve(options.root, "CLAUDE.md"), label: "CLAUDE.md", type: "file" }];
  }
  if (!options.global && target === "windsurf") {
    return [{ path: resolve(options.root, ".windsurfrules"), label: ".windsurfrules", type: "file" }];
  }
  if (options.global && target === "claude") {
    return [{ path: resolve(options.home, ".claude", "CLAUDE.md"), label: "~/.claude/CLAUDE.md", type: "block" }];
  }
  return [];
}

function migrateLegacy(target, options) {
  const actions = [];
  for (const legacy of legacyLocations(target, options)) {
    if (!existsSync(legacy.path)) continue;
    const existing = readFileSync(legacy.path, "utf8");
    if (legacy.type === "file" && isExactLegacyRule(existing)) {
      if (!options.dryRun) rmSync(legacy.path);
      actions.push({ action: "migrated", label: legacy.label, path: legacy.path, target });
      continue;
    }
    if (legacy.type === "block" && markerState(existing).valid) {
      const removed = removeManagedBlock(existing);
      if (!options.dryRun) {
        if (removed.content) writeFileSync(legacy.path, removed.content, "utf8");
        else rmSync(legacy.path);
      }
      actions.push({ action: "migrated", label: legacy.label, path: legacy.path, target });
      continue;
    }
    if (existing.includes("# Steady Catch Mode") || existing.includes(MANAGED_START)) {
      actions.push({ action: "legacy-conflict", label: legacy.label, path: legacy.path, target });
    }
  }
  return actions;
}

function writeDedicated(destination, desired, options) {
  if (!existsSync(destination.path)) {
    if (!options.dryRun) {
      mkdirSync(dirname(destination.path), { recursive: true });
      writeFileSync(destination.path, desired, "utf8");
    }
    return "created";
  }

  const existing = readFileSync(destination.path, "utf8");
  const legacy = isExactLegacyTarget(existing, destination.target);
  if (!existing.includes(FILE_MARKER) && !legacy && !options.force) {
    throw new Error(`${destination.label} already exists and is not managed by steady-catch; rerun with --force to replace it`);
  }
  if (!options.dryRun) writeFileSync(destination.path, desired, "utf8");
  return existing === desired ? "unchanged" : legacy ? "migrated" : "updated";
}

function writeShared(destination, desired, options) {
  const exists = existsSync(destination.path);
  const existing = exists ? readFileSync(destination.path, "utf8") : "";
  const legacy = exists && isExactLegacyTarget(existing, destination.target);
  const merged = legacy ? desired : mergeManagedBlock(existing, desired, { force: options.force });
  if (!options.dryRun) {
    mkdirSync(dirname(destination.path), { recursive: true });
    writeFileSync(destination.path, merged, "utf8");
  }
  if (!exists) return "created";
  if (legacy) return "migrated";
  return existing === merged ? "unchanged" : markerState(existing).valid ? "updated" : "merged";
}

export function installRules(options) {
  const results = [];
  const futureTense = {
    created: "create",
    merged: "merge",
    migrated: "migrate",
    updated: "update",
  };
  for (const target of options.targets) {
    const destination = destinationForTarget(target, options);
    const desired = renderForTarget(target, options);
    const action = destination.shared
      ? writeShared(destination, desired, options)
      : writeDedicated(destination, desired, options);
    results.push({
      action: options.dryRun && futureTense[action] ? `would-${futureTense[action]}` : action,
      label: destination.label,
      path: destination.path,
      target,
    });
    results.push(...migrateLegacy(target, options).map((result) => ({
      ...result,
      action: options.dryRun && result.action === "migrated" ? "would-migrate" : result.action,
    })));
  }
  return results;
}

function onlyGeneratedEnvelopeRemains(content) {
  let remaining = content.trim();
  if (!remaining.startsWith("---\n")) return remaining === "";
  const closing = remaining.indexOf("\n---", 4);
  if (closing === -1) return false;
  remaining = remaining.slice(closing + 4).trim();
  return remaining === "";
}

export function removeRules(options) {
  const results = [];
  for (const target of options.targets) {
    const destination = destinationForTarget(target, options);
    if (!existsSync(destination.path)) {
      results.push({ action: "missing", label: destination.label, path: destination.path, target });
      continue;
    }
    const existing = readFileSync(destination.path, "utf8");
    if (!existing.includes(MANAGED_START)) {
      if (isExactLegacyTarget(existing, target)) {
        if (!options.dryRun) rmSync(destination.path);
        results.push({ action: options.dryRun ? "would-remove" : "removed", label: destination.label, path: destination.path, target });
      } else {
        results.push({ action: "unmanaged", label: destination.label, path: destination.path, target });
      }
      continue;
    }

    const removed = removeManagedBlock(existing);
    if (!options.dryRun) {
      if (existing.includes(FILE_MARKER) && onlyGeneratedEnvelopeRemains(removed.content)) rmSync(destination.path);
      else if (removed.content) writeFileSync(destination.path, removed.content, "utf8");
      else rmSync(destination.path);
    }
    results.push({ action: options.dryRun ? "would-remove" : "removed", label: destination.label, path: destination.path, target });
  }
  return results;
}

function inspectDestination(target, options) {
  const destination = destinationForTarget(target, options);
  if (!existsSync(destination.path)) return { status: "missing", ...destination };
  const content = readFileSync(destination.path, "utf8");
  const state = markerState(content);
  if (state.malformed) return { status: "conflict", ...destination };
  if (state.valid) return { status: "ok", ...destination };
  if (isExactLegacyTarget(content, target)) return { status: "legacy", ...destination };
  return { status: destination.shared ? "missing" : "conflict", ...destination };
}

export function doctor(options) {
  const results = options.targets.map((target) => inspectDestination(target, options));
  for (const target of options.targets) {
    for (const legacy of legacyLocations(target, options)) {
      if (!existsSync(legacy.path)) continue;
      const existing = readFileSync(legacy.path, "utf8");
      if (isExactLegacyRule(existing) || markerState(existing).valid || existing.includes("# Steady Catch Mode")) {
        results.push({ status: "legacy", target, ...legacy });
      }
    }
  }

  if (options.global) {
    const oldContinue = resolve(options.home, ".continue", "rules", "steady-catch.md");
    if (existsSync(oldContinue)) {
      results.push({
        status: "legacy",
        target: "continue",
        label: "~/.continue/rules/steady-catch.md",
        path: oldContinue,
      });
    }
  }
  return results;
}

export function listTargets({ global = false, home = homedir(), os = platform() } = {}) {
  const names = global ? GLOBAL_TARGET_NAMES : TARGET_NAMES;
  return names.map((target) => {
    const options = { global, home, os, root: process.cwd() };
    const destination = destinationForTarget(target, options);
    return { target, path: destination.label, scope: global ? "global" : "project" };
  });
}

function phraseBankPath({ global = false, home = homedir(), root = process.cwd() } = {}) {
  return global
    ? resolve(home, ".steady-catch", "phrases.global.md")
    : resolve(root, ".steady-catch", "phrases.local.md");
}

function normalizePhrase(phrase) {
  return phrase.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function phraseFromLine(line) {
  const match = line.match(/^-\s+(?:\[[^\]]+\]\s*){0,2}(.+?)\s*$/);
  return match?.[1] ?? null;
}

export function listPhrases(options = {}) {
  const path = phraseBankPath(options);
  if (!existsSync(path)) return { path, phrases: [] };
  const phrases = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map(phraseFromLine)
    .filter(Boolean);
  return { path, phrases };
}

function validatePhrase({ category, lang, phrase }) {
  if (!phrase || !phrase.trim()) throw new Error("evolve requires --phrase or positional phrase text");
  if (phrase.includes("\n") || phrase.includes("\r")) throw new Error("Phrases must fit on one line");
  if (phrase.length > 500) throw new Error("Phrases must be 500 characters or fewer");
  if (!VALID_PHRASE_LANGS.has(lang)) throw new Error("Invalid phrase --lang. Use zh, en, or bilingual");
  if (!/^[a-z0-9][a-z0-9-]{0,31}$/i.test(category)) {
    throw new Error("Phrase --category must be a short letter, number, or hyphen label");
  }
}

export function addPhrase(options) {
  validatePhrase(options);
  const path = phraseBankPath(options);
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const duplicate = existing
    .split(/\r?\n/)
    .map(phraseFromLine)
    .filter(Boolean)
    .some((phrase) => normalizePhrase(phrase) === normalizePhrase(options.phrase));
  if (duplicate) return { action: "duplicate", path, phrase: options.phrase };

  const title = options.global ? "# Global Steady-Catch Phrases" : "# Local Steady-Catch Phrases";
  const prefix = existing.trim()
    ? existing.trimEnd()
    : `${title}\n\n${PHRASE_BANK_MARKER}`;
  const today = (options.now ?? new Date()).toISOString().slice(0, 10);
  const output = `${prefix}\n\n## ${today}\n\n- [${options.lang}] [${options.category}] ${options.phrase.trim()}\n`;
  if (!options.dryRun) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, output, "utf8");
  }
  return { action: options.dryRun ? "would-add" : "added", path, phrase: options.phrase.trim() };
}

export function removePhrase(options) {
  const path = phraseBankPath(options);
  if (!existsSync(path)) return { action: "missing", path, phrase: options.phrase };
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  let removed = false;
  const kept = lines.filter((line) => {
    const saved = phraseFromLine(line);
    if (saved && normalizePhrase(saved) === normalizePhrase(options.phrase)) {
      removed = true;
      return false;
    }
    return true;
  });
  if (!removed) return { action: "missing", path, phrase: options.phrase };
  const output = `${kept.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
  if (!options.dryRun) writeFileSync(path, output, "utf8");
  return { action: options.dryRun ? "would-remove" : "removed", path, phrase: options.phrase };
}
