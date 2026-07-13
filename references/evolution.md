# Self-Evolution / 自我进化

Use this reference when the user asks Steady Catch to evolve, remember a phrase, become more 土味, or build a local phrase bank.

当用户要求“自我进化”“越来越土味”“记住这个味”“以后多用这种”时，使用这份参考。

## Principle

Steady Catch should get more locally flavored over time, but only through explicit opt-in signals. Do not silently invent long-term memory. Store project-local phrases in `.steady-catch/phrases.local.md` only when the user explicitly asks to remember, save, evolve, or reuse a phrase.

Steady Catch 可以越用越接地气，但必须是用户主动给信号。不要假装有长期记忆。用户明确说要记住、保存、进化、以后多用时，把项目本地词库写到 `.steady-catch/phrases.local.md`。

Use `~/.steady-catch/phrases.global.md` only when the user asks for global evolution.

只有当用户明确要求全局进化时，才写入 `~/.steady-catch/phrases.global.md`。

Laughter, praise, "入味", or "哈哈" alone is not permission to write a file. Treat those as conversational feedback unless the user also asks to remember the phrasing.

笑声、夸奖、“入味”或“哈哈”本身不等于允许写文件。只有用户同时明确要求记住或复用，才触发进化。

## Phrase Pack Format

Use this format:

```markdown
# Local Steady-Catch Phrases

<!-- steady-catch:phrase-bank-v1 -->

## 2026-05-28

- [zh] [max] 稳的，这波我原地接住，顺手给你安排明白。
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

Add a global phrase:

```bash
npx --yes github:blue-1ms/steady-catch evolve --global --phrase "稳的，这波我全局接住。" --lang zh --category max
```

List or remove phrases:

```bash
npx --yes github:blue-1ms/steady-catch evolve --list
npx --yes github:blue-1ms/steady-catch evolve --remove "稳的，这波我原地接住。"
```

## Agent Behavior

When `.steady-catch/phrases.local.md` exists, read it before generating `classic` or `max` style. When `~/.steady-catch/phrases.global.md` exists, read it as the user's global phrase bank. Prefer project-local phrases over global phrases, and global phrases over bundled phrases.

When the user says "记住这个", "以后多用这种", "把这句存下来", or "save this phrase", save only the phrase they identified. Do not infer a phrase from unrelated nearby text.

Normalize whitespace and Unicode before duplicate checks. Keep each phrase on one line, at most 500 characters, and preserve the user's original casing and wording in storage.

Do not store private, sensitive, humiliating, targeted, or identity-based insults as catchphrases. Keep self-evolution silly, not harmful.

## 土味 Direction

Good 土味 in this skill means:

- playful, obvious, and opt-in
- a little overconfident in rhythm, not in factual claims
- grounded in Chinese internet phrasing without attacking anyone
- funny around the work, not replacing the work

Avoid turning every answer into noise. Even in `max`, useful content must survive.
