---
name: add-migration
description: Add a PostgreSQL schema migration for the TypeScript time deposit API. Use when changing tables, columns, indexes or constraints.
---

1. Create `typescript/src/adapters/out/postgres/migrations/NNN_description.sql` with the next number.
2. Write plain SQL: quoted camelCase identifiers, `NUMERIC(15, 2)` for money, `DATE` for dates, `NOT NULL` where required.
3. Never edit a committed migration; add a new one instead.
4. Update the affected `Postgres*Repository.ts`, `openapi.yaml` and `seed.sql`.
5. Run `yarn typecheck && yarn test:integration` from `typescript/`.

Migrations run automatically on `yarn start` and in integration tests.
