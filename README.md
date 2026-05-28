# steady-catch / 稳稳接住模式

<p align="center">
  <img src="https://img.shields.io/badge/MODES-3-555555?style=for-the-badge" alt="3 modes">
  <img src="https://img.shields.io/badge/TARGETS-8-00A36C?style=for-the-badge" alt="8 targets">
  <img src="https://img.shields.io/badge/LANGUAGES-ZH%20%2B%20EN-0EA5E9?style=for-the-badge" alt="Chinese and English">
  <img src="https://img.shields.io/badge/MAX_MODE-%E5%9C%9F%E5%91%B3%E6%8B%89%E6%BB%A1-8B5CF6?style=for-the-badge" alt="Max mode">
  <img src="https://img.shields.io/badge/SELF_EVOLVING-%E8%B6%8A%E6%9D%A5%E8%B6%8A%E5%9C%9F-FF8A00?style=for-the-badge" alt="Self evolving">
  <a href="https://github.com/blue-1ms/steady-catch/stargazers"><img src="https://img.shields.io/github/stars/blue-1ms/steady-catch?style=for-the-badge&logo=github&label=STARS" alt="GitHub stars"></a>
</p>

**English:** A playful Agent Skill for controlled AI catchphrase energy: "I've got you", "let me steady this first", and the gently over-empathetic voice people love to roast.

**中文：** 一个可控的 AI 梗味 Agent Skill：稳的、我接住这个点、先把它接稳。它不是让 agent 乱油，而是让“AI 味”变成可选择、可降级、可复用的风格层。

This repository is both:

- a Codex-compatible Agent Skill
- a small cross-IDE/CLI rule generator for coding assistants

这个仓库同时提供：

- 可直接安装的 Codex Agent Skill
- 面向多种 IDE / CLI agent 的规则文件生成器

## Max Mode for Friends / 给朋友直接装 Max

**English:** Send your friend this command. Run it in the project where they want the agent rules installed:

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max
```

Only install for one assistant:

```bash
npx --yes github:blue-1ms/steady-catch init --ai cursor --mode max
```

**中文：** 直接把这条发给朋友，让 TA 在项目根目录运行：

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max
```

只给某一个工具装：

```bash
npx --yes github:blue-1ms/steady-catch init --ai cursor --mode max
```

`max` 是土味拉满模式：适合 demo、截图、整活；严肃任务仍会降级成可靠回答。

## Quick Start

### English

Install as a Codex skill:

```bash
git clone https://github.com/blue-1ms/steady-catch.git ~/.codex/skills/steady-catch
```

Use it explicitly:

```text
Use $steady-catch to rewrite this response in classic steady-catch mode.
```

Generate rules for the current project:

```bash
git clone https://github.com/blue-1ms/steady-catch.git
cd steady-catch
node scripts/steady-catch.mjs init --ai all --mode classic
```

### 中文

安装为 Codex skill：

```bash
git clone https://github.com/blue-1ms/steady-catch.git ~/.codex/skills/steady-catch
```

显式调用：

```text
Use $steady-catch 把这段回答改成 classic 稳稳接住模式。
```

给当前项目生成多平台规则文件：

```bash
git clone https://github.com/blue-1ms/steady-catch.git
cd steady-catch
node scripts/steady-catch.mjs init --ai all --mode classic
```

## Installation Options / 安装方式

### 1. Codex Skill

**English:** Best when you want Codex to load the skill by name.

**中文：** 如果你希望 Codex 通过 `$steady-catch` 直接调用，这是最推荐的方式。

```bash
git clone https://github.com/blue-1ms/steady-catch.git ~/.codex/skills/steady-catch
```

### 2. Per-Project Rules

**English:** Best when you want Cursor, Claude Code, Copilot, Windsurf, Gemini CLI, Cline, Continue, or Codex to follow the same opt-in style rule inside a repository.

**中文：** 如果你想让一个项目里的 Cursor、Claude Code、Copilot、Windsurf、Gemini CLI、Cline、Continue、Codex 都能按需使用这个风格，用这个。

```bash
node scripts/steady-catch.mjs init --ai all --mode classic
```

Preview without writing files:

```bash
node scripts/steady-catch.mjs init --ai all --mode classic --dry-run
```

Generate only selected targets:

```bash
node scripts/steady-catch.mjs init --ai codex,cursor,claude --mode light
```

### 3. GitHub npx Install

**English:** Use this when you do not want to clone the repository first.

**中文：** 如果你不想先 clone 仓库，可以直接从 GitHub 临时运行 CLI。

```bash
npx github:blue-1ms/steady-catch init --ai all --mode classic
```

Dry-run first:

```bash
npx github:blue-1ms/steady-catch init --ai all --dry-run
```

### 4. Manual Copy

**English:** Copy the rule content from `scripts/generate-agent-rules.mjs --dry-run` into your assistant's custom-instructions file.

**中文：** 如果你的工具暂时不在支持列表里，可以先 dry-run，把输出复制到该工具的自定义规则文件中。

```bash
node scripts/generate-agent-rules.mjs --target codex --dry-run
```

## Supported Targets / 支持目标

| Target | File |
| --- | --- |
| `codex` | `AGENTS.md` |
| `claude` | `CLAUDE.md` |
| `cursor` | `.cursor/rules/steady-catch.mdc` |
| `copilot` | `.github/copilot-instructions.md` |
| `windsurf` | `.windsurfrules` |
| `gemini` | `GEMINI.md` |
| `cline` | `.clinerules/steady-catch.md` |
| `continue` | `.continue/rules/steady-catch.md` |

List targets:

```bash
node scripts/steady-catch.mjs targets
```

## Modes / 模式

| Mode | English | 中文 |
| --- | --- | --- |
| `light` | One small wink, then normal useful work. | 只来一句梗味，剩下认真干活。 |
| `classic` | Default steady-catch flavor. | 默认稳稳接住味。 |
| `max` | Parody mode for demos and screenshots. | 梗味拉满，适合 demo 和截图。 |

Example:

```bash
node scripts/steady-catch.mjs init --target cursor --mode max
```

## Usage Examples / 使用示例

English:

```text
Use $steady-catch to make this PR summary lightly cringe but still useful.
```

```text
Rewrite this support reply in classic steady-catch mode.
```

中文：

```text
Use $steady-catch 把这段报错解释改成 light 接住味，但不要影响技术准确性。
```

```text
把这个 agent 的 system prompt 改成 max 稳稳接住模式，适合发截图玩。
```

## Self-Evolution / 自我进化

**English:** Steady Catch can evolve per project. Generated rules tell agents to read `.steady-catch/phrases.local.md` when it exists, so each team can collect its own increasingly cheesy catchphrases.

Add a local phrase:

```bash
npx --yes github:blue-1ms/steady-catch evolve --phrase "稳的，这波我原地接住，顺手给你安排明白。" --lang zh --category max
```

**中文：** 这个 skill 可以按项目越用越土。生成出来的规则会读取 `.steady-catch/phrases.local.md`，所以每个项目都能积累自己的本地土味词库。

添加一条本地土味：

```bash
npx --yes github:blue-1ms/steady-catch evolve --phrase "稳的，这波我原地接住，顺手给你安排明白。" --lang zh --category max
```

When users say things like "记住这个味", "这个更土", "以后多用这种", or "save this phrase", the agent should treat it as a candidate for the local phrase pack.

当用户说“记住这个味”“这个更土”“以后多用这种”时，agent 应该把它当成本地词库候选。

## Safety / 边界

**English:** The bit is opt-in. Serious medical, legal, financial, self-harm, security, production-incident, credential, and data-loss contexts should downgrade to plain direct style unless the user explicitly asks for satire after the serious answer is handled.

**中文：** 这个风格必须是自愿开启的。医疗、法律、金融、自伤、安全、生产事故、凭证、数据丢失等严肃场景应该自动降级成直接可靠的回答。先把正事处理完，再决定要不要玩梗。

## Development / 开发

Validate the skill:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py .
```

Preview generated rules:

```bash
npm run preview:rules
```

The main source files are:

- `SKILL.md`
- `references/modes.md`
- `references/phrases.zh.md`
- `references/phrases.en.md`
- `references/evolution.md`
- `scripts/steady-catch.mjs`
- `scripts/generate-agent-rules.mjs`
