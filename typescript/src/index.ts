import { Pool } from 'pg'
import { migrate, seed } from './adapters/out/postgres/migrate'
import { buildApp } from './compositionRoot'
import { config } from './config'

async function main() {
  const pool = new Pool({ connectionString: config.databaseUrl })
  await migrate(pool)
  if (config.seedDatabase) {
    await seed(pool)
  }

  buildApp(pool).listen(config.port, () => {
    console.log(`Time deposit API listening on http://localhost:${config.port}/api`)
    console.log(`Swagger UI: http://localhost:${config.port}/docs`)
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
