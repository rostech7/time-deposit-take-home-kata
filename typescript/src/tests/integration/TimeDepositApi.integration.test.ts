import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import type { Express } from 'express'
import { Pool } from 'pg'
import request from 'supertest'
import { migrate } from '../../adapters/out/postgres/migrate'
import { buildApp } from '../../compositionRoot'

jest.setTimeout(120_000)

describe('Time deposit API (Postgres via Testcontainers)', () => {
  let container: StartedPostgreSqlContainer
  let pool: Pool
  let app: Express

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start()
    pool = new Pool({ connectionString: container.getConnectionUri() })
    await migrate(pool)
    app = buildApp(pool)
  })

  afterAll(async () => {
    await pool?.end()
    await container?.stop()
  })

  beforeEach(async () => {
    await pool.query('TRUNCATE withdrawals, "timeDeposits" RESTART IDENTITY CASCADE')
    await pool.query(`
      INSERT INTO "timeDeposits" ("planType", days, balance) VALUES
        ('basic', 45, 1234567.00),
        ('student', 400, 1000.00),
        ('premium', 46, 1000.00),
        ('premium', 45, 1000.00)`)
    await pool.query(`
      INSERT INTO withdrawals ("timeDepositId", amount, date) VALUES
        (1, 250.50, '2026-03-02'),
        (1, 1000.00, '2026-01-15')`)
  })

  test('GET /api/time-deposits returns every deposit with its withdrawals', async () => {
    const response = await request(app).get('/api/time-deposits').expect(200)

    expect(response.body).toEqual([
      {
        id: 1,
        planType: 'basic',
        balance: 1234567,
        days: 45,
        withdrawals: [
          { id: 2, amount: 1000, date: '2026-01-15' },
          { id: 1, amount: 250.5, date: '2026-03-02' },
        ],
      },
      { id: 2, planType: 'student', balance: 1000, days: 400, withdrawals: [] },
      { id: 3, planType: 'premium', balance: 1000, days: 46, withdrawals: [] },
      { id: 4, planType: 'premium', balance: 1000, days: 45, withdrawals: [] },
    ])
  })

  test('POST /api/time-deposits/balance-updates applies and persists one month of interest', async () => {
    await request(app).post('/api/time-deposits/balance-updates').expect(204)

    const { rows } = await pool.query('SELECT id, balance FROM "timeDeposits" ORDER BY id')
    expect(rows).toEqual([
      { id: 1, balance: '1235595.81' },
      { id: 2, balance: '1000.00' },
      { id: 3, balance: '1004.17' },
      { id: 4, balance: '1000.00' },
    ])
  })

  test('exposes no endpoints beyond the contract', async () => {
    await request(app).delete('/api/time-deposits').expect(405)
    await request(app).get('/api/withdrawals').expect(404)
  })
})
