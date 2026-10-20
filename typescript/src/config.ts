export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl:
    process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/time_deposits',
  seedDatabase: process.env.SEED_DATABASE === 'true',
  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
}
