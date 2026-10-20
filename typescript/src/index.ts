import { Pool } from 'pg'
import { migrate, seed } from './adapters/out/postgres/migrate'
import { buildApp } from './compositionRoot'
import { config } from './config'
import { logger } from './logger'

async function main() {
  const pool = new Pool({ connectionString: config.databaseUrl })
  pool.on('error', (error) => logger.error({ err: error }, 'Idle database connection error'))
  await migrate(pool)
  if (config.seedDatabase) {
    await seed(pool)
  }

  const server = buildApp(pool).listen(config.port, () => {
    logger.info(
      {
        api: `http://localhost:${config.port}/api`,
        docs: `http://localhost:${config.port}/docs`,
      },
      'Time deposit API listening',
    )
  })

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down')
    server.close(() => {
      pool.end().then(() => process.exit(0))
    })
  }
  process.once('SIGTERM', shutdown)
  process.once('SIGINT', shutdown)
}

main().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start')
  process.exit(1)
})
