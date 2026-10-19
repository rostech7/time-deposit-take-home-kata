# AI-assisted development

## Setup

- **Agent:** [Claude Code](https://claude.com/claude-code) with Claude Opus 5.5.
- **Rules:** [`CLAUDE.md`](CLAUDE.md), loaded automatically in every session.
- **Skills:** [`add-migration`](.claude/skills/add-migration/SKILL.md) and [`add-tests`](.claude/skills/add-tests/SKILL.md).
- **Hooks:** [`.claude/settings.json`](.claude/settings.json) runs Biome on every file the agent writes or edits, so agent output always matches the project style.

To reproduce, run `npm install -g @anthropic-ai/claude-code`, then run `claude` in the repo root.

## How it was used

The agent prepared each step under my strict supervision and ran the type checks and tests

- **AI-assisted:** analysing the kata, recording the characterization test values, the refactor, the adapters, the OpenAPI contract, the SQL, and debugging setup issues.
