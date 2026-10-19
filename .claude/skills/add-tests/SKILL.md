---
name: add-tests
description: Add unit or integration tests to the TypeScript time deposit API. Use when writing or changing tests.
---

1. Pick the location:
   - interest rules → `typescript/src/tests/InterestPolicies.test.ts`
   - use cases → `typescript/src/tests/UseCases.test.ts`, using in-memory fake repositories
   - SQL, routes, contract → `typescript/src/tests/integration/*.integration.test.ts` (Testcontainers + supertest)
2. Use literal expected values with exact equality. Test both sides of every day boundary.
3. Never change expected values in `TimeDepositCalculator.test.ts`.
4. Run `yarn typecheck && yarn test` from `typescript/` (needs Docker).
