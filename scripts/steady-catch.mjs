#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const generatorPath = resolve(scriptDir, "generate-agent-rules.mjs");
const targets = ["codex", "claude", "cursor", "copilot", "windsurf", "gemini", "cline", "continue"];
const globalTargets = ["codex", "claude", "gemini", "continue"];

function printHelp() {
  console.log(`steady-catch

Usage:
  steady-catch init --all --mode classic
  steady-catch init --target codex,cursor --mode light --dry-run
  steady-catch init --ai all --mode classic
  steady-catch init --ai all --mode max
  steady-catch init --global --ai all --mode max
  steady-catch evolve --phrase "稳的，这波我原地接住。" --lang zh --category max
  steady-catch evolve --global --phrase "稳的，这波我全局接住。"
  steady-catch targets

Commands:
  init       Generate project rule files for IDEs and CLI agents.
  rules      Alias for init.
  evolve     Append a local phrase to .steady-catch/phrases.local.md.
  targets    List supported targets.
  help       Show this help.

Options passed to init/rules:
  --all                 Generate every supported target.
  --target <names>      Comma-separated targets: ${targets.join(", ")}.
  --ai <names>          Alias for --target. Accepts "all".
  --global              Install to global instruction files where file-based global rules are known.
  --mode <mode>         light, classic, or max. Default: classic.
  --lang <lang>         auto, zh, en, or bilingual. Default: auto.
  --root <path>         Directory to write into. Default: current working directory.
  --dry-run             Print paths and content without writing files.

Options passed to evolve:
  --phrase <text>       Phrase to save. Required unless provided as positional text.
  --lang <lang>         zh, en, or bilingual. Default: zh.
  --category <name>     signature, classic, max, earthy, follow-up, etc. Default: max.
  --root <path>         Directory containing .steady-catch/. Default: current working directory.
  --global              Save to ~/.steady-catch/phrases.global.md instead of project-local phrases.
`);
}

function runGenerator(args) {
  const result = spawnSync(process.execPath, [generatorPath, ...args], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`steady-catch: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

function readOption(args, name, fallback = null) {
  const prefix = `--${name}=`;
  const equalsValue = args.find((arg) => arg.startsWith(prefix));
  if (equalsValue) return equalsValue.slice(prefix.length);

  const index = args.indexOf(`--${name}`);
  if (index !== -1) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`--${name} requires a value`);
    }
    return value;
  }

  return fallback;
}

function hasFlag(args, name) {
  return args.includes(`--${name}`);
}

function positionalText(args) {
  const optionsWithValues = new Set(["--phrase", "--lang", "--category", "--root"]);
  const parts = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      if (optionsWithValues.has(arg)) i += 1;
      continue;
    }
    parts.push(arg);
  }
  return parts.join(" ").trim();
}

function evolve(args) {
  const isGlobal = hasFlag(args, "global");
  const root = readOption(args, "root", process.cwd());
  const lang = readOption(args, "lang", "zh");
  const category = readOption(args, "category", "max");
  const phrase = readOption(args, "phrase", positionalText(args));

  if (!phrase) {
    throw new Error('evolve requires --phrase "..." or positional phrase text');
  }

  const phraseDir = isGlobal ? resolve(homedir(), ".steady-catch") : resolve(root, ".steady-catch");
  const phraseFile = resolve(phraseDir, isGlobal ? "phrases.global.md" : "phrases.local.md");
  const today = new Date().toISOString().slice(0, 10);
  const entry = `\n## ${today} - ${category} (${lang})\n\n- ${phrase}\n`;

  mkdirSync(phraseDir, { recursive: true });
  appendFileSync(phraseFile, entry, "utf8");
  console.log(`saved ${phraseFile}`);
}

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith("--") ? args.shift() : "init";

try {
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
  } else if (command === "targets") {
    console.log((args.includes("--global") ? globalTargets : targets).join("\n"));
  } else if (command === "init" || command === "rules" || command === "generate") {
    runGenerator(args);
  } else if (command === "evolve") {
    evolve(args);
  } else {
    console.error(`steady-catch: unknown command "${command}"`);
    console.error("Run steady-catch help for usage.");
    process.exit(1);
  }
} catch (error) {
  console.error(`steady-catch: ${error.message}`);
  process.exit(1);
}
