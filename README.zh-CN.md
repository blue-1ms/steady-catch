# steady-catch / 稳稳接住模式

<p align="center">
  <img src="https://img.shields.io/badge/AGENT_SKILLS-COMPATIBLE-00A36C?style=for-the-badge" alt="兼容 Agent Skills">
  <img src="https://img.shields.io/badge/RULE_ADAPTERS-8-0EA5E9?style=for-the-badge" alt="8 个规则适配器">
  <img src="https://img.shields.io/badge/LANGUAGES-ZH%20%2B%20EN-E11D48?style=for-the-badge" alt="中文和英文">
  <img src="https://img.shields.io/badge/NODE-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node 18 或更高版本">
  <a href="https://github.com/blue-1ms/steady-catch/blob/main/LICENSE"><img src="https://img.shields.io/github/license/blue-1ms/steady-catch?style=for-the-badge" alt="MIT 许可证"></a>
  <a href="https://github.com/blue-1ms/steady-catch/stargazers"><img src="https://img.shields.io/github/stars/blue-1ms/steady-catch?style=for-the-badge&logo=github&label=STARS" alt="GitHub Stars"></a>
  <img src="https://img.shields.io/badge/SELF_EVOLVING-CONSENSUALLY-FF8A00?style=for-the-badge" alt="经用户同意后自我进化">
</p>

<p align="center">
  <a href="README.md">English</a> | <strong>简体中文</strong>
</p>

一个可控的双语 Agent Skill，专门添加大家爱吐槽的 AI 口头禅能量：稳的、我接住这个点、先把它接稳、`great question`、`you're absolutely right`，以及那种过度努力想显得温柔的助手口吻。

Steady Catch 把梗放在答案周围，不拿梗代替答案。它提供三档强度、严肃场景自动降级、必须经过用户同意才会进化的词库，以及 8 个常用 coding agent 规则适配器。

## 两种安装方式

Steady Catch 使用两条互补的安装路线：

1. **安装 Agent Skill**：让兼容 Agent 可以调用 `$steady-catch`，这是默认推荐方式。
2. **安装规则适配器**：给项目或支持的全局指令文件固定模式和触发策略。

安装 Skill 不会让所有回复自动进入 Max。只有安装规则时选择 `--activation always` 才会持续发作。

## 安装 Skill

开放的 [Skills CLI](https://www.skills.sh/docs/cli) 会识别当前 Agent，并把标准 `SKILL.md` 安装到正确位置。

给当前项目和检测到的 Agent 安装：

```bash
npx skills add blue-1ms/steady-catch -y
```

给检测到的 Agent 全局安装：

```bash
npx skills add blue-1ms/steady-catch -g -y
```

给电脑上所有支持的 Agent 全局安装：

```bash
npx skills add blue-1ms/steady-catch --all -g -y
```

显式调用：

```text
Use $steady-catch 用 max 模式回答，但技术内容必须准确。
```

在支持隐式调用的 Agent 中，`steady-catch max`、`稳稳接住模式`、`接住味`、`AI 味`、`越来越土` 等自然语言也可以匹配这个 Skill。

## 安装 Max 规则

如果想给 coding IDE 和 CLI 配好规则文件，使用仓库自带 CLI。

Max 模式，但只有点名时才触发：

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max --activation on-request
```

普通回答也持续 Max：

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max --activation always
```

安装支持的文件型全局规则：

```bash
npx --yes github:blue-1ms/steady-catch init --global --ai all --mode max --activation on-request
```

只预览，不写文件：

```bash
npx --yes github:blue-1ms/steady-catch init --ai all --mode max --dry-run
```

只选部分适配器：

```bash
npx --yes github:blue-1ms/steady-catch init --ai codex,cursor,claude --mode classic
```

## 触发方式和强度

### v0.3 更新

开启后风格在当前对话持续。短聊短接，Max 不再要求堆口头禅或套固定三段式。

- “太土了”降低一档，“更土一点”提高一档；明确指定模式优先。
- “正常说话”“别玩梗”或 `steady-catch off` 立即退出，包括 always 预设。
- 调味只影响当前对话。保存词库和修改安装配置仍需明确要求。
- 单次改写只作用于那份内容，新对话不继承未保存的偏好。

指令保持跨模型通用。Astra 是本次更新的起因，但安装检查和 CLI 测试不能证明某个模型的风格效果。人工验收场景见[多轮对话用例](evals/conversation.md)。

| 设置 | 行为 |
| --- | --- |
| `--activation on-request` | 默认值。只有用户明确点名后才使用配置的风格。 |
| `--activation always` | 普通且适合玩梗的回答也使用该风格，安全降级仍然优先。 |
| `--mode light` | 最多一句小梗，剩下正常干活。 |
| `--mode classic` | 自然接话，适当带梗，不套固定模板。 |
| `--mode max` | 明显 parody，土味拉满，但有用内容不能掉。 |

语言可以选择 `auto`、`zh`、`en` 或 `bilingual`：

```bash
npx --yes github:blue-1ms/steady-catch init --ai cursor --mode max --lang zh
```

## 规则适配矩阵

项目规则：

| 目标 | 项目路径 |
| --- | --- |
| `codex` | `AGENTS.md` |
| `claude` | `.claude/rules/steady-catch.md` |
| `cursor` | `.cursor/rules/steady-catch.mdc` |
| `copilot` | `.github/copilot-instructions.md` |
| `windsurf` | `.windsurf/rules/steady-catch.md` |
| `gemini` | `GEMINI.md` |
| `cline` | `.clinerules/steady-catch.md` |
| `continue` | `.continue/rules/steady-catch.md` |

经过核对的文件型全局规则：

| 目标 | 全局路径 |
| --- | --- |
| `codex` | `~/.codex/AGENTS.md` |
| `claude` | `~/.claude/rules/steady-catch.md` |
| `copilot` | `~/.copilot/copilot-instructions.md` |
| `windsurf` | `~/.codeium/windsurf/memories/global_rules.md` |
| `gemini` | `~/.gemini/GEMINI.md` |
| `cline` | `~/Documents/Cline/Rules/steady-catch.md` |

Cursor 的全局 User Rules 位于应用设置里，没有可靠的文件路径。Continue 官方提供项目规则，但没有可靠的个人全局规则文件。它们建议使用全局 Skill 或项目规则。

路径参考：[Codex Skills 与 AGENTS.md](https://developers.openai.com/codex/skills)、[Claude memory 与 rules](https://code.claude.com/docs/en/memory)、[Gemini context files](https://geminicli.com/docs/cli/gemini-md/) 和 [Continue rules](https://docs.continue.dev/customize/rules)。

## 安全更新和卸载

共享文件使用以下托管标记：

```markdown
<!-- steady-catch:start -->
...
<!-- steady-catch:end -->
```

重复运行 `init` 或 `update` 只会修改这个区块。Steady Catch 专用文件会带生成标记。如果同一路径已经存在不属于 Steady Catch 的文件，CLI 会报告冲突，不会覆盖；只有显式添加 `--force` 才会替换。

更新已经安装的 Agent Skill：

```bash
npx skills update steady-catch -g -y
```

重新运行配置即可更新规则适配器：

只更新 Skill 不会更新之前生成的规则。需要重生成 v0.2 规则，移除旧的固定回答结构，必要时重开 Agent 会话。手动粘贴的旧规则需手动替换。

```bash
npx --yes github:blue-1ms/steady-catch update --ai all --mode max --activation on-request
```

检查当前项目规则和 v0.1 遗留路径：

```bash
npx --yes github:blue-1ms/steady-catch doctor --all
```

卸载 Agent Skill：

```bash
npx skills remove steady-catch -g -y
```

只移除 Steady Catch 管理的规则内容：

```bash
npx --yes github:blue-1ms/steady-catch uninstall --all
```

完全符合 v0.1 输出的 `CLAUDE.md` 和 `.windsurfrules` 会自动迁移到新路径。修改过或无法确认归属的旧文件只会被报告，不会被覆盖或删除。

## 自我进化词库

项目词库位于 `.steady-catch/phrases.local.md`，全局词库位于 `~/.steady-catch/phrases.global.md`。

添加一句：

```bash
npx --yes github:blue-1ms/steady-catch evolve \
  --phrase "给力奥铁子，这波我给你接瓷实了。" \
  --lang zh \
  --category max
```

查看和删除：

```bash
npx --yes github:blue-1ms/steady-catch evolve --list
npx --yes github:blue-1ms/steady-catch evolve --remove "给力奥铁子，这波我给你接瓷实了。"
```

词库优先级是项目本地、全局、内置参考。CLI 会在去重时标准化空白和 Unicode，但保存时保留用户原话。

只有“记住这个味”“以后多用这种”“把这句存下来”或 `save this phrase` 等明确指令才能写词库。“哈哈”“入味”“就是这样”等反馈本身不算写入授权。

## 发给朋友的话术

短版：

```text
我发现了一个非常没有必要、但意外地很守规矩的 Agent Skill。它能给你的 coding agent 加上可调节的“稳稳接住”AI 味，又不会耽误它干正事。

全局安装：
npx skills add blue-1ms/steady-catch -g -y

装完对它说：steady-catch max
```

让朋友直接交给自己的 Agent 安装 Skill 和全局 Max 规则：

```text
请给所有支持的 Agent 全局安装 Steady Catch Skill，然后给有可靠文件型全局规则路径的 Agent 配置 Max 模式，使用 on-request 触发。

运行：
npx skills add blue-1ms/steady-catch --all -g -y
npx --yes github:blue-1ms/steady-catch init --global --ai all --mode max --activation on-request

完成后报告安装了哪些 Skill 和规则路径。保留所有无关文件内容，不要整文件覆盖。
```

## 安全边界

这个梗必须由用户主动开启。医疗、法律、金融、自伤、虐待、安全、生产事故、凭证和数据丢失场景会降级为直接可靠的语言。Steady Catch 不会用温柔掩盖不确定性、缺失测试、未完成工作或薄弱证据。

## 开发与验证

```bash
npm install
npm test
npm run validate:skill
npm run check
```

预览规则适配器：

```bash
npm run preview:rules
```

`targets`、`init`、`update`、`remove` 和 `doctor` 支持机器可读输出：

```bash
node scripts/steady-catch.mjs targets --json
node scripts/steady-catch.mjs doctor --all --json
```

项目采用 [MIT License](LICENSE)。
