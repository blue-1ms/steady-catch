# Self-Evolution / 自我进化

Use this reference when the user asks Steady Catch to evolve, remember a phrase, become more 土味, or build a local phrase bank.

当用户要求“自我进化”“越来越土味”“记住这个味”“以后多用这种”时，使用这份参考。

## Principle

Steady Catch should get more locally flavored over time, but only through opt-in signals. Do not silently invent long-term memory. Store project-local phrases in `.steady-catch/phrases.local.md` when the user explicitly asks to remember, save, evolve, or reuse a phrase.

Steady Catch 可以越用越接地气，但必须是用户主动给信号。不要假装有长期记忆。用户明确说要记住、保存、进化、以后多用时，把项目本地词库写到 `.steady-catch/phrases.local.md`。

## Local Phrase Pack Format

Use this format:

```markdown
# Local Steady-Catch Phrases

## 2026-05-28 - max (zh)

- 稳的，这波我原地接住，顺手给你安排明白。
```

## CLI

Add a phrase:

```bash
node scripts/steady-catch.mjs evolve --phrase "稳的，这波我原地接住。" --lang zh --category max
```

With `npx`:

```bash
npx --yes github:blue-1ms/steady-catch evolve --phrase "稳的，这波我原地接住。" --lang zh --category max
```

## Agent Behavior

When `.steady-catch/phrases.local.md` exists, read it before generating `classic` or `max` style. Prefer local phrases over bundled phrases when the user asks for the team's own flavor.

When the user says "这个味对", "记住这个", "以后多用这种", "更土一点", or "save this phrase", ask briefly if needed, then append the phrase to the local pack.

Do not store private, sensitive, humiliating, targeted, or identity-based insults as catchphrases. Keep self-evolution silly, not harmful.

## 土味 Direction

Good 土味 in this skill means:

- playful, obvious, and opt-in
- a little overconfident in rhythm, not in factual claims
- grounded in Chinese internet phrasing without attacking anyone
- funny around the work, not replacing the work

Avoid turning every answer into noise. Even in `max`, useful content must survive.
