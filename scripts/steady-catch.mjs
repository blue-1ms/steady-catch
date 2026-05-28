#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const generatorPath = resolve(scriptDir, "generate-agent-rules.mjs");
const targets = ["codex", "claude", "cursor", "copilot", "windsurf", "gemini", "cline", "continue"];

function printHelp() {
  console.log(`steady-catch

Usage:
  steady-catch init --all --mode classic
  steady-catch init --target codex,cursor --mode light --dry-run
  steady-catch init --ai all --mode classic
  steady-catch targets

Commands:
  init       Generate project rule files for IDEs and CLI agents.
  rules      Alias for init.
  targets    List supported targets.
  help       Show this help.

Options passed to init/rules:
  --all                 Generate every supported target.
  --target <names>      Comma-separated targets: ${targets.join(", ")}.
  --ai <names>          Alias for --target. Accepts "all".
  --mode <mode>         light, classic, or max. Default: classic.
  --lang <lang>         auto, zh, en, or bilingual. Default: auto.
  --root <path>         Directory to write into. Default: current working directory.
  --dry-run             Print paths and content without writing files.
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

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith("--") ? args.shift() : "init";

if (command === "help" || command === "--help" || command === "-h") {
  printHelp();
} else if (command === "targets") {
  console.log(targets.join("\n"));
} else if (command === "init" || command === "rules" || command === "generate") {
  runGenerator(args);
} else {
  console.error(`steady-catch: unknown command "${command}"`);
  console.error("Run steady-catch help for usage.");
  process.exit(1);
}
