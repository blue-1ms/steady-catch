#!/usr/bin/env node

import {
  VERSION,
  addPhrase,
  doctor,
  installRules,
  listPhrases,
  listTargets,
  parseRuleArgs,
  removePhrase,
  removeRules,
} from "./lib/steady-catch-core.mjs";

function printHelp() {
  console.log(`steady-catch v${VERSION}

Usage:
  steady-catch init --all --mode max --activation on-request
  steady-catch update --global --all --mode classic
  steady-catch remove --target cursor,claude
  steady-catch doctor --all
  steady-catch evolve --phrase "稳的，这波我原地接住。" --lang zh --category max
  steady-catch evolve --list
  steady-catch evolve --remove "稳的，这波我原地接住。"
  steady-catch targets [--global] [--json]

Commands:
  init, rules, update       Install or update project/global rule adapters.
  remove, uninstall        Remove only steady-catch-managed rules.
  doctor                   Inspect installations, conflicts, and v0.1 leftovers.
  evolve                   Add, list, or remove opt-in phrases.
  targets                  List supported rule adapters and paths.
  help                     Show this help.

Rule options:
  --all                    Select all targets available in the scope.
  --target, --ai <list>    Comma-separated targets or "all".
  --global                 Use verified file-based global paths.
  --mode <mode>            light, classic, or max. Default: classic.
  --lang <lang>            auto, zh, en, or bilingual. Default: auto.
  --activation <value>     on-request or always. Default: on-request.
  --root <path>            Project directory. Default: current directory.
  --dry-run                Preview without writing.
  --force                  Replace conflicting dedicated steady-catch files.
  --json                   Print machine-readable results.

Evolve options:
  --phrase <text>          Phrase to add; positional text is also accepted.
  --list                   List saved phrases.
  --remove <text>          Remove one exact phrase.
  --lang <lang>            zh, en, or bilingual. Default: zh.
  --category <name>        Short category label. Default: max.
  --root <path>            Project directory. Default: current directory.
  --global                 Use ~/.steady-catch/phrases.global.md.
  --dry-run                Preview without writing.
  --json                   Print machine-readable results.
`);
}

function readOption(args, name, fallback = null) {
  const prefix = `--${name}=`;
  const equalsValue = args.find((arg) => arg.startsWith(prefix));
  if (equalsValue) return equalsValue.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`--${name} requires a value`);
  return value;
}

function hasFlag(args, name) {
  return args.includes(`--${name}`);
}

function positionalPhrase(args) {
  const valueOptions = new Set(["--phrase", "--remove", "--lang", "--category", "--root"]);
  const parts = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      if (valueOptions.has(arg)) i += 1;
      continue;
    }
    parts.push(arg);
  }
  return parts.join(" ").trim();
}

function evolveOptions(args) {
  return {
    category: readOption(args, "category", "max"),
    dryRun: hasFlag(args, "dry-run"),
    global: hasFlag(args, "global"),
    json: hasFlag(args, "json"),
    lang: readOption(args, "lang", "zh"),
    phrase: readOption(args, "phrase", positionalPhrase(args)),
    root: readOption(args, "root", process.cwd()),
  };
}

function printResults(results, json) {
  const values = Array.isArray(results) ? results : [results];
  if (json) console.log(JSON.stringify(results, null, 2));
  else for (const result of values) console.log(`${result.action} ${result.label ?? result.path}`);
}

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith("--") ? args.shift() : "init";

try {
  if (["help", "--help", "-h"].includes(command) || args.includes("--help") || args.includes("-h")) {
    printHelp();
  } else if (["init", "rules", "generate", "update"].includes(command)) {
    const options = parseRuleArgs(args);
    printResults(installRules(options), options.json);
  } else if (["remove", "uninstall"].includes(command)) {
    const options = parseRuleArgs(args);
    printResults(removeRules(options), options.json);
  } else if (command === "doctor") {
    const options = parseRuleArgs(args, { defaultAll: true });
    const results = doctor(options);
    if (options.json) console.log(JSON.stringify(results, null, 2));
    else for (const result of results) console.log(`[${result.status}] ${result.target} ${result.label}`);
    if (results.some((result) => result.status !== "ok")) process.exitCode = 1;
  } else if (command === "targets") {
    const unknown = args.filter((arg) => !["--global", "--json"].includes(arg));
    if (unknown.length) throw new Error(`Unknown argument: ${unknown[0]}`);
    const results = listTargets({ global: hasFlag(args, "global") });
    if (hasFlag(args, "json")) console.log(JSON.stringify(results, null, 2));
    else for (const result of results) console.log(`${result.target}\t${result.path}`);
  } else if (command === "evolve") {
    const options = evolveOptions(args);
    if (hasFlag(args, "list")) {
      const result = listPhrases(options);
      if (options.json) console.log(JSON.stringify(result, null, 2));
      else if (result.phrases.length) for (const phrase of result.phrases) console.log(phrase);
      else console.log(`no phrases saved in ${result.path}`);
    } else if (readOption(args, "remove")) {
      options.phrase = readOption(args, "remove");
      printResults(removePhrase(options), options.json);
    } else {
      printResults(addPhrase(options), options.json);
    }
  } else {
    throw new Error(`unknown command "${command}"; run steady-catch help for usage`);
  }
} catch (error) {
  console.error(`steady-catch: ${error.message}`);
  process.exitCode = 1;
}
