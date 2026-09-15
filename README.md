# steady-catch

<p align="center">
  <img src="https://img.shields.io/badge/AGENT_SKILLS-COMPATIBLE-00A36C?style=for-the-badge" alt="Agent Skills compatible">
  <img src="https://img.shields.io/badge/RULE_ADAPTERS-8-0EA5E9?style=for-the-badge" alt="8 rule adapters">
  <img src="https://img.shields.io/badge/LANGUAGES-ZH%20%2B%20EN-E11D48?style=for-the-badge" alt="Chinese and English">
  <img src="https://img.shields.io/badge/NODE-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node 18 or newer">
  <a href="https://github.com/blue-1ms/steady-catch/blob/main/LICENSE"><img src="https://img.shields.io/github/license/blue-1ms/steady-catch?style=for-the-badge" alt="MIT license"></a>
  <a href="https://github.com/blue-1ms/steady-catch/stargazers"><img src="https://img.shields.io/github/stars/blue-1ms/steady-catch?style=for-the-badge&logo=github&label=STARS" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/SELF_EVOLVING-CONSENSUALLY-FF8A00?style=for-the-badge" alt="Consensual self evolution">
</p>

<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">简体中文</a>
</p>

A playful bilingual Agent Skill for controlled AI catchphrase energy: "I've got you", "let me steady this first", "great question", and the overly empathetic assistant voice people love to roast.

Steady Catch keeps the joke around the answer, not instead of the answer. It has three intensity modes, explicit safety downgrades, phrase banks that evolve only with consent, and rule adapters for eight popular coding agents.

## Two Ways To Install

Steady Catch uses two complementary installation paths:

1. **Agent Skill installation** makes `$steady-catch` available on compatible agents. This is the recommended default.
2. **Rule adapter installation** configures a project or supported global instruction file with a fixed mode and activation policy.

Installing the Skill does not force every response into Max mode. Installing a rule with `--activation always` does.

## Install The Skill

The open [Skills CLI](https://www.skills.sh/docs/cli) detects your agent and installs the standard `SKILL.md` package in the correct location.

Current project and detected agent:

```bash
npx skills add blue-1ms/steady-catch -y
```

Globally for the detected agent:

```bash
npx skills add blue-1ms/steady-catch -g -y
```

Globally for every supported agent detected on the machine:

```bash
npx skills add blue-1ms/steady-catch --all -g -y
```

Invoke it explicitly:

```text
Use $steady-catch in max mode and keep the technical answer precise.
```

Natural-language triggers such as `steady-catch max`, `cringe mode`, `synthetic warmth`, or `AI catchphrase mode` also match the Skill description on agents that support implicit invocation.

## Install Max Rules

Use the repository CLI when you want rule files configured for coding IDEs and CLIs.

Max mode, activated only when requested:

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max --activation on-request
```

Max mode on ordinary eligible replies:

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max --activation always
```

Install supported file-based global rules:

```bash
npx --yes github:blue-1ms/steady-catch init --global --ai all --mode max --activation on-request
```

Preview every action without writing:

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max --dry-run
```

Select individual adapters:

```bash
npx --yes github:blue-1ms/steady-catch init --ai codex,cursor,claude --mode classic
```

## Activation And Modes

### New In v0.3

Once activated, the style continues in the current conversation. Short follow-ups stay short; Max no longer calls for stacked catchphrases or a fixed three-part response.

- `too much` lowers intensity one step; `more cringe` raises it. A named mode overrides this adjustment.
- `stop the bit` or `steady-catch off` returns to plain language, even with an always preset.
- Feedback changes the current conversation only. Saving phrases and changing installed settings still require explicit requests.
- A one-shot rewrite stays scoped to that artifact. New conversations do not inherit unsaved preferences.

The instructions are model-independent. Astra prompted this revision, but installation checks and CLI tests alone do not establish model-specific quality. See [behavioral evaluation cases](evals/conversation.md) for the manual checks.

| Setting | Behavior |
| --- | --- |
| `--activation on-request` | Default. The configured style appears only after a clear user trigger. |
| `--activation always` | Applies the configured style to ordinary eligible replies. Safety downgrades still win. |
| `--mode light` | One small flourish, then normal work. |
| `--mode classic` | Natural warmth and a relevant catchphrase, without a fixed template. |
| `--mode max` | Obvious parody and extra cheesy phrasing while preserving the useful answer. |

Language can be `auto`, `zh`, `en`, or `bilingual`:

```bash
npx --yes github:blue-1ms/steady-catch init --ai cursor --mode max --lang en
```

## Rule Adapter Matrix

Project adapters:

| Target | Project path |
| --- | --- |
| `codex` | `AGENTS.md` |
| `claude` | `.claude/rules/steady-catch.md` |
| `cursor` | `.cursor/rules/steady-catch.mdc` |
| `copilot` | `.github/copilot-instructions.md` |
| `windsurf` | `.windsurf/rules/steady-catch.md` |
| `gemini` | `GEMINI.md` |
| `cline` | `.clinerules/steady-catch.md` |
| `continue` | `.continue/rules/steady-catch.md` |

Verified file-based global adapters:

| Target | Global path |
| --- | --- |
| `codex` | `~/.codex/AGENTS.md` |
| `claude` | `~/.claude/rules/steady-catch.md` |
| `copilot` | `~/.copilot/copilot-instructions.md` |
| `windsurf` | `~/.codeium/windsurf/memories/global_rules.md` |
| `gemini` | `~/.gemini/GEMINI.md` |
| `cline` | `~/Documents/Cline/Rules/steady-catch.md` |

Cursor global User Rules live in the application settings rather than a reliable file path. Continue documents project rules but not a reliable personal global file. Use global Skill installation or project rules for those two.

Path references: [Codex Skills and AGENTS.md](https://developers.openai.com/codex/skills), [Claude memory and rules](https://code.claude.com/docs/en/memory), [Gemini context files](https://geminicli.com/docs/cli/gemini-md/), and [Continue rules](https://docs.continue.dev/customize/rules).

## Safe Updates And Removal

Shared files use these managed markers:

```markdown
<!-- steady-catch:start -->
...
<!-- steady-catch:end -->
```

Re-running `init` or `update` changes only that block. Dedicated steady-catch files carry a generated marker. Existing unrelated dedicated files cause a conflict instead of being overwritten; `--force` is required to replace one.

Update installed Agent Skills:

```bash
npx skills update steady-catch -g -y
```

Update rule adapters by re-running the desired configuration:

Updating the Skill alone does not update previously generated rules. Regenerate v0.2 rules to remove their old fixed response structure, then reload the agent session if needed. Manually pasted rules need manual replacement.

```bash
npx --yes github:blue-1ms/steady-catch update --ai all --mode max --activation on-request
```

Inspect current project rules and v0.1 leftovers:

```bash
npx --yes github:blue-1ms/steady-catch doctor --all
```

Remove Agent Skills:

```bash
npx skills remove steady-catch -g -y
```

Remove only Steady Catch-managed rule content:

```bash
npx --yes github:blue-1ms/steady-catch uninstall --all
```

Exact v0.1 `CLAUDE.md` and `.windsurfrules` outputs migrate automatically to current dedicated paths. Modified or ambiguous legacy files are reported and left untouched.

## Self-Evolving Phrase Banks

Project phrases live in `.steady-catch/phrases.local.md`. Global phrases live in `~/.steady-catch/phrases.global.md`.

Add a phrase:

```bash
npx --yes github:blue-1ms/steady-catch evolve \
  --phrase "I've got this with enterprise-grade tenderness." \
  --lang en \
  --category max
```

List and remove phrases:

```bash
npx --yes github:blue-1ms/steady-catch evolve --list
npx --yes github:blue-1ms/steady-catch evolve --remove "I've got this with enterprise-grade tenderness."
```

Phrase priority is project-local, then global, then bundled references. The CLI normalizes duplicate checks and preserves the saved wording.

Agents may save a phrase only after explicit instructions such as `save this phrase` or `use this more often`. Laughter, praise, or `that is the flavor` alone is not write permission.

## Send This To A Friend

Short version:

```text
I found a deeply unnecessary but surprisingly disciplined Agent Skill. It gives your coding agent selectable "I've got you" AI energy without replacing the actual work.

Install it globally:
npx skills add blue-1ms/steady-catch -g -y

Then say: steady-catch max
```

Ask their agent to install the Skill and global Max adapters:

```text
Install Steady Catch globally for every supported agent, then configure the verified file-based global rule adapters in Max mode with on-request activation.

Run:
npx skills add blue-1ms/steady-catch --all -g -y
npx --yes github:blue-1ms/steady-catch init --global --ai all --mode max --activation on-request

Report which Skill and rule paths were installed. Preserve all unrelated file content.
```

## Safety

The bit is opt-in. Medical, legal, financial, self-harm, abuse, security, production incident, credential, and data-loss contexts downgrade to plain direct language. Steady Catch never uses warmth to hide uncertainty, missing tests, incomplete work, or weak evidence.

## Development

```bash
npm install
npm test
npm run validate:skill
npm run check
```

Preview adapters:

```bash
npm run preview:rules
```

Machine-readable output is available on `targets`, `init`, `update`, `remove`, and `doctor`:

```bash
node scripts/steady-catch.mjs targets --json
node scripts/steady-catch.mjs doctor --all --json
```

Licensed under the [MIT License](LICENSE).
