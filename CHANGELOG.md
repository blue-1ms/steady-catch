# Changelog

All notable changes to Steady Catch are documented here.

## [0.2.0] - 2026-07-13

### Added

- Standard cross-agent installation through `npx skills add`.
- `on-request` and `always` activation modes.
- Safe `update`, `remove`/`uninstall`, `doctor`, `--json`, and `--force` CLI flows.
- Phrase listing, exact removal, validation, and normalized duplicate detection.
- Node test coverage, skill metadata validation, and GitHub Actions CI.
- Separate English and Simplified Chinese README files.

### Changed

- Updated Claude Code and Windsurf project rule paths.
- Added verified file-based global adapters for Copilot CLI, Windsurf, and Cline.
- Made every shared-file installation use a managed Markdown block.
- Expanded the English and Chinese phrase palettes while tightening explicit opt-in evolution rules.

### Migration

- Exact v0.1 `CLAUDE.md` and `.windsurfrules` outputs migrate automatically.
- Modified or ambiguous legacy files are reported without being overwritten.
- Cursor and Continue global behavior now uses standard Skill installation or project rules because no reliable file-based global rule path is claimed.

## [0.1.0] - 2026-05-28

- Initial bilingual Skill, three intensity modes, eight rule targets, and local/global phrase banks.
