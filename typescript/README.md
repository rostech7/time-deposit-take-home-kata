# XA Bank Time Deposit API (TypeScript)

[![CI](https://github.com/rostech7/time-deposit-take-home-kata/actions/workflows/ci.yml/badge.svg)](https://github.com/rostech7/time-deposit-take-home-kata/actions/workflows/ci.yml)

Express, PostgreSQL, OpenAPI/Swagger, hexagonal architecture, Testcontainers.

## Run

Requires Node >= 16 and Docker.

```sh
yarn install
docker compose up -d --wait
SEED_DATABASE=true yarn start
```

Environment variables: `PORT` (default `3000`), `DATABASE_URL` (default `postgres://postgres:postgres@localhost:5432/time_deposits`), `SEED_DATABASE`.

### Docker

Every successful CI run on `main` publishes an image to GitHub Container Registry. To run the published image together with PostgreSQL and demo data, without installing Node:

```sh
docker compose --profile full up -d --wait            # published image from GHCR
docker compose --profile local up -d --wait --build   # image built from your working copy
docker compose --profile full --profile local down -v # stop and remove data
```

The API runs on http://localhost:3000. Use `API_PORT` or `POSTGRES_PORT` to change the host ports.

## Endpoints

| Method | Path                                 | Result                                                           |
| ------ | ------------------------------------ | ---------------------------------------------------------------- |
| `GET`  | `/api/time-deposits`                 | All deposits: `id`, `planType`, `balance`, `days`, `withdrawals` |
| `POST` | `/api/time-deposits/balance-updates` | Applies one month of interest to all deposits (`204`)            |

**Swagger UI:** open http://localhost:3000/docs, then for each endpoint click **Try it out** → **Execute**:

1. `GET /time-deposits` shows the current balances.
2. `POST /time-deposits/balance-updates` returns `204`.
3. `GET /time-deposits` again shows the balances after one month of interest.

The contract is in [`src/adapters/in/http/openapi.yaml`](src/adapters/in/http/openapi.yaml). Response types are generated from it with `yarn generate:api`, so `tsc` fails if the code drifts from the contract.

## Tests

```sh
yarn test:unit          # no Docker needed
yarn test:integration   # needs Docker
yarn test               # all
yarn typecheck
yarn lint               # Biome lint + format check (lint:fix to fix)
```

- **Integration tests:** run against a real Postgres. Responses are validated against the OpenAPI contract.
- **Pre-commit hook:** `yarn install` sets up a [lefthook](https://lefthook.dev) hook (`../lefthook.yml`) that formats and re-stages the staged files with Biome and runs `typecheck` before each commit.

## Architecture

```
src/
  domain/             TimeDeposit, TimeDepositCalculator, interest policies
  application/        ports (in/out) and use cases
  adapters/in/http    Express routes, OpenAPI, Swagger UI
  adapters/out/postgres  repositories, SQL migrations, seed data
  compositionRoot.ts  wiring
```

Interest rules use the Strategy pattern. Each plan type maps to an `InterestPolicy` in `src/domain/interest/defaultInterestPolicies.ts`:

```ts
basic: new FixedRateInterestPolicy(0.01, [afterGracePeriod]),
student: new FixedRateInterestPolicy(0.03, [afterGracePeriod, youngerThanDays(366)]),
premium: new FixedRateInterestPolicy(0.05, [afterGracePeriod, olderThanDays(45)]),
```

To add a plan, implement `InterestPolicy` and add an entry to that map.
