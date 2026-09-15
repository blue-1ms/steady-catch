#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { VERSION } from "./lib/steady-catch-core.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = resolve(root, "SKILL.md");
const skill = readFileSync(skillPath, "utf8");
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);

if (!frontmatter) throw new Error("SKILL.md must start with YAML frontmatter");
if (!/^name:\s*steady-catch\s*$/m.test(frontmatter[1])) {
  throw new Error("SKILL.md frontmatter must declare name: steady-catch");
}
const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
if (!description || description.length < 40) {
  throw new Error("SKILL.md frontmatter needs a useful description");
}

const requiredFiles = [
  "README.md",
  "README.zh-CN.md",
  "LICENSE",
  "agents/openai.yaml",
  "references/modes.md",
  "references/conversation.md",
  "references/phrases.en.md",
  "references/phrases.zh.md",
  "references/evolution.md",
  "scripts/steady-catch.mjs",
];
for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing required skill file: ${file}`);
}

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
if (pkg.version !== VERSION) throw new Error("Package and CLI versions must match");

console.log("steady-catch skill metadata is valid");
