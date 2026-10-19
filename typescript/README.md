# XA Bank Time Deposit API (TypeScript)

Express, PostgreSQL, OpenAPI/Swagger, hexagonal architecture, Testcontainers.

## Run

Requires Node >= 16 and Docker.

```sh
yarn install
docker compose up -d --wait
SEED_DATABASE=true yarn start
```

Environment variables: `PORT` (default `3000`), `DATABASE_URL` (default `postgres://postgres:postgres@localhost:5432/time_deposits`), `SEED_DATABASE`.

## Endpoints

| Method | Path                                 | Result                                                           |
| ------ | ------------------------------------ | ---------------------------------------------------------------- |
| `GET`  | `/api/time-deposits`                 | All deposits: `id`, `planType`, `balance`, `days`, `withdrawals` |
| `POST` | `/api/time-deposits/balance-updates` | Applies one month of interest to all deposits (`204`)            |

**Swagger UI:** open http://localhost:3000/docs

The contract is in [`src/adapters/in/http/openapi.yaml`](src/adapters/in/http/openapi.yaml).

## Tests

```sh
yarn test:unit          # no Docker needed
yarn test:integration   # needs Docker
yarn test               # all
yarn typecheck
yarn lint               # Biome lint + format check (lint:fix to fix)
```

- **Integration tests:** run against a real Postgres. Responses are validated against the OpenAPI contract.

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
