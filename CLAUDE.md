# CLAUDE.md — agent rules for this repository

These rules are loaded automatically by Claude Code at the start of every session in this repository.

## Scope

- The solution lives in `typescript/`. The other language folders are the untouched original kata.
- Exactly two API endpoints: `GET /api/time-deposits` and `POST /api/time-deposits/balance-updates`. Do not add any more.

## Hard constraints

- Do not upgrade Node or TypeScript (TS stays 4.8.3; `engines.node` stays `>=16`). Libraries can be added, but they must type-check under TS 4.8.
- Do not change the shared `TimeDeposit` class or the `TimeDepositCalculator.updateBalance(xs)` signature.
- `updateBalance` behaviour must stay byte-for-byte identical. The characterization tests in `src/tests/TimeDepositCalculator.test.ts` (values recorded from the original code) must always pass. Never change their expected values to make a test pass.
- Keep tests plain and readable: no copies of production algorithms in tests and no snapshot tests.

## Architecture (hexagonal)

- `domain/` imports nothing outside `domain/`.
- `application/` imports only `domain/` and its own `ports/`.
- `adapters/` implement the ports. Only `compositionRoot.ts` and `index.ts` know about concrete adapters.
- New interest rules: implement `InterestPolicy` (Strategy) and map a plan type to it in `defaultInterestPolicies`. Don't add branches to the calculator.
- Keep the code simple. Don't add defensive code for edge cases the domain won't hit.
- The OpenAPI contract (`adapters/in/http/openapi.yaml`) is the source of truth. Change it first, then the code. Responses are validated against it.

## Skills

- Schema changes: follow the `add-migration` skill (`.claude/skills/add-migration/SKILL.md`).
- Writing tests: follow the `add-tests` skill (`.claude/skills/add-tests/SKILL.md`).

## Workflow

- Test first. Add or extend a test before changing behaviour.
- Before declaring work done, run `yarn lint`, `yarn typecheck` and `yarn test` (the integration tests need Docker).
- Atomic commits: one logical change per commit, with an imperative subject line.
- Record ambiguity in a code comment that states the assumption.
- Match the existing style (no semicolons, single quotes, width 100), enforced by Biome: run `yarn lint` (`yarn lint:fix` to fix).
