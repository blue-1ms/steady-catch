# steady-catch

稳稳接住模式 for agents, IDEs, CLIs, and anyone who wants the AI to be just a little too emotionally available on purpose.

This repo is both a Codex-compatible Agent Skill and a tiny generator for cross-tool coding-agent rules.

## Install as a Codex skill

Clone this repository into your skills directory:

```bash
git clone https://github.com/blue-1ms/steady-catch.git ~/.codex/skills/steady-catch
```

Then invoke it explicitly:

```text
Use $steady-catch to rewrite this answer in classic steady-catch mode.
```

## Generate IDE/CLI rules

Preview all supported rule files:

```bash
node scripts/generate-agent-rules.mjs --all --dry-run
```

Write rules into the current repository:

```bash
node scripts/generate-agent-rules.mjs --all --mode classic
```

Supported targets:

- `codex` -> `AGENTS.md`
- `claude` -> `CLAUDE.md`
- `cursor` -> `.cursor/rules/steady-catch.mdc`
- `copilot` -> `.github/copilot-instructions.md`
- `windsurf` -> `.windsurfrules`
- `gemini` -> `GEMINI.md`
- `cline` -> `.clinerules/steady-catch.md`
- `continue` -> `.continue/rules/steady-catch.md`

## Modes

- `light`: one wink, then normal useful work
- `classic`: the default steady-catch flavor
- `max`: parody mode for demos and screenshots

The bit is opt-in. Serious safety, medical, legal, financial, incident, security, and production contexts should downgrade to plain direct style unless the user explicitly asks for satire after the serious answer is handled.
