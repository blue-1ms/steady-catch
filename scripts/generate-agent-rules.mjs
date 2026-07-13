#!/usr/bin/env node

import { installRules, parseRuleArgs } from "./lib/steady-catch-core.mjs";

function printHelp() {
  console.log(`steady-catch rule generator

Usage:
  steady-catch-rules --all --mode classic
  steady-catch-rules --target codex,cursor --mode max --activation on-request
  steady-catch-rules --global --all --mode max --activation always

Options:
  --all                 Generate every supported target for the selected scope.
  --target, --ai <list> Comma-separated target names or "all".
  --global              Write supported file-based global rules.
  --mode <mode>         light, classic, or max. Default: classic.
  --lang <lang>         auto, zh, en, or bilingual. Default: auto.
  --activation <value>  on-request or always. Default: on-request.
  --root <path>         Project directory. Default: current directory.
  --dry-run             Preview actions without writing.
  --force               Replace a conflicting dedicated steady-catch file.
  --json                Print machine-readable results.
`);
}

try {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
  } else {
    const options = parseRuleArgs(args);
    const results = installRules(options);
    if (options.json) console.log(JSON.stringify(results, null, 2));
    else for (const result of results) console.log(`${result.action} ${result.label}`);
  }
} catch (error) {
  console.error(`steady-catch: ${error.message}`);
  process.exitCode = 1;
}
