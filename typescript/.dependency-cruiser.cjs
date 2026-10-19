// Hexagonal architecture rules, checked by `yarn arch` (and in CI).
// Dependencies may only point inward: adapters → application → domain.
module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment: 'The domain depends on nothing outside the domain (no application, adapters or libraries).',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { pathNot: '^src/domain' },
    },
    {
      name: 'application-depends-only-on-domain',
      comment: 'Use cases and ports may only use the domain and other application code.',
      severity: 'error',
      from: { path: '^src/application' },
      to: { pathNot: '^src/(application|domain)' },
    },
    {
      name: 'adapters-are-independent',
      comment: 'Inbound (HTTP) and outbound (Postgres) adapters must not import each other.',
      severity: 'error',
      from: { path: '^src/adapters/in' },
      to: { path: '^src/adapters/out' },
    },
    {
      name: 'adapters-are-independent-reverse',
      severity: 'error',
      from: { path: '^src/adapters/out' },
      to: { path: '^src/adapters/in' },
    },
    {
      name: 'only-composition-root-wires-adapters',
      comment: 'Only the composition root, entry point and tests may import concrete adapters.',
      severity: 'error',
      from: { path: '^src', pathNot: '^src/(adapters|compositionRoot\\.ts|index\\.ts|tests)' },
      to: { path: '^src/adapters' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    // Also check `import type`, so ports and use cases cannot even reference adapter types.
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
}
