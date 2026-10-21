import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { Pool } from 'pg'
import { migrate } from '../../adapters/out/postgres/migrate'
import { withTransaction } from '../../adapters/out/postgres/withTransaction'

jest.setTimeout(120_000)

describe('Postgres adapter infrastructure', () => {
  let container: StartedPostgreSqlContainer
  let pool: Pool

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start()
    pool = new Pool({ connectionString: container.getConnectionUri() })
  })

  afterAll(async () => {
    await pool?.end()
    await container?.stop()
  })

  test('concurrent start-ups apply the migrations once, without failing', async () => {
    await Promise.all([migrate(pool), migrate(pool), migrate(pool)])

    const { rows } = await pool.query('SELECT name FROM schema_migrations')
    expect(rows).toEqual([{ name: '001_create_time_deposits_and_withdrawals.sql' }])
  })

  test('a transaction whose connection dies reports the original error', async () => {
    const killOwnConnection = withTransaction(pool, (client) =>
      client.query('SELECT pg_terminate_backend(pg_backend_pid())'),
    )

    await expect(killOwnConnection).rejects.toThrow('terminating connection')
    await expect(pool.query('SELECT 1 AS ok')).resolves.toMatchObject({ rows: [{ ok: 1 }] })
  })
})
