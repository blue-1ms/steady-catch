#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const TARGETS = {
  codex: "AGENTS.md",
  claude: "CLAUDE.md",
  cursor: ".cursor/rules/steady-catch.mdc",
  copilot: ".github/copilot-instructions.md",
  windsurf: ".windsurfrules",
  gemini: "GEMINI.md",
  cline: ".clinerules/steady-catch.md",
  continue: ".continue/rules/steady-catch.md",
};

const TARGET_ALIASES = {
  "claude-code": "claude",
  "github-copilot": "copilot",
  "gemini-cli": "gemini",
};

const VALID_MODES = new Set(["light", "classic", "max"]);
const VALID_LANGS = new Set(["auto", "zh", "en", "bilingual"]);

function addTargets(options, rawTargets) {
  const names = rawTargets
    .split(",")
    .map((target) => target.trim())
    .filter(Boolean);

  if (names.includes("all")) {
    options.all = true;
    return;
  }

  options.targets.push(...names.map((target) => TARGET_ALIASES[target] ?? target));
}

function parseArgs(argv) {
  const options = {
    all: false,
    dryRun: false,
    root: process.cwd(),
    mode: "classic",
    lang: "auto",
    targets: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const readValue = () => {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }
      i += 1;
      return next;
    };

    if (arg === "--all") options.all = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--root") options.root = readValue();
    else if (arg.startsWith("--root=")) options.root = arg.slice("--root=".length);
    else if (arg === "--mode") options.mode = readValue();
    else if (arg.startsWith("--mode=")) options.mode = arg.slice("--mode=".length);
    else if (arg === "--lang") options.lang = readValue();
    else if (arg.startsWith("--lang=")) options.lang = arg.slice("--lang=".length);
    else if (arg === "--target" || arg === "--targets" || arg === "--ai" || arg === "--ais") addTargets(options, readValue());
    else if (arg.startsWith("--target=")) addTargets(options, arg.slice("--target=".length));
    else if (arg.startsWith("--targets=")) addTargets(options, arg.slice("--targets=".length));
    else if (arg.startsWith("--ai=")) addTargets(options, arg.slice("--ai=".length));
    else if (arg.startsWith("--ais=")) addTargets(options, arg.slice("--ais=".length));
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.targets = options.targets.map((target) => target.trim()).filter(Boolean);
  if (options.all) options.targets = Object.keys(TARGETS);
  if (options.targets.length === 0) options.targets = ["codex"];

  if (!VALID_MODES.has(options.mode)) {
    throw new Error(`Invalid --mode "${options.mode}". Use one of: ${[...VALID_MODES].join(", ")}`);
  }
  if (!VALID_LANGS.has(options.lang)) {
    throw new Error(`Invalid --lang "${options.lang}". Use one of: ${[...VALID_LANGS].join(", ")}`);
  }

  const unknownTargets = options.targets.filter((target) => !TARGETS[target]);
  if (unknownTargets.length > 0) {
    throw new Error(`Unknown target(s): ${unknownTargets.join(", ")}. Use one of: ${Object.keys(TARGETS).join(", ")}`);
  }

  return options;
}

function printHelp() {
  console.log(`steady-catch rule generator

Usage:
  node scripts/generate-agent-rules.mjs --all --mode classic
  node scripts/generate-agent-rules.mjs --target codex,cursor --mode light --dry-run
  node scripts/generate-agent-rules.mjs --ai all --mode classic

Options:
  --all                 Generate every supported target.
  --target <names>      Comma-separated targets: ${Object.keys(TARGETS).join(", ")}.
  --ai <names>          Alias for --target. Accepts "all".
  --mode <mode>         light, classic, or max. Default: classic.
  --lang <lang>         auto, zh, en, or bilingual. Default: auto.
  --root <path>         Directory to write into. Default: current working directory.
  --dry-run             Print paths and content without writing files.
`);
}

function baseRule({ mode, lang }) {
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

function renderForTarget(target, options) {
  const rule = baseRule(options);
  if (target === "cursor") {
    return `---
description: "Steady Catch Mode: controlled AI catchphrase energy"
alwaysApply: false
---

${rule}`;
  }

  if (target === "copilot") {
    return `${rule}
## GitHub Copilot Note

Apply this only when the prompt asks for the style. Normal code completions and reviews should stay direct.
`;
  }

  return rule;
}

function writeTarget(target, options) {
  const relativePath = TARGETS[target];
  const absolutePath = resolve(options.root, relativePath);
  const content = renderForTarget(target, options);

  if (options.dryRun) {
    console.log(`--- ${relativePath} ---`);
    console.log(content);
    return;
  }

  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
  console.log(`wrote ${relativePath}`);
}

try {
  const options = parseArgs(process.argv.slice(2));
  for (const target of options.targets) {
    writeTarget(target, options);
  }
} catch (error) {
  console.error(`steady-catch: ${error.message}`);
  console.error("Run with --help for usage.");
  process.exit(1);
}
