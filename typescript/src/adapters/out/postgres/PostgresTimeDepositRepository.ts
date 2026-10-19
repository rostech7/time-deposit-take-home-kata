import type { Pool } from 'pg'
import type { TimeDepositRepository } from '../../../application/ports/out/TimeDepositRepository'
import { TimeDeposit } from '../../../domain/TimeDeposit'

interface TimeDepositRow {
  id: number
  planType: string
  balance: string // pg returns NUMERIC as string to avoid silent precision loss
  days: number
}

const SELECT_ALL = 'SELECT id, "planType", balance, days FROM "timeDeposits" ORDER BY id'

const toDomain = (row: TimeDepositRow) =>
  new TimeDeposit(row.id, row.planType, Number(row.balance), row.days)

export class PostgresTimeDepositRepository implements TimeDepositRepository {
  constructor(private readonly pool: Pool) {}

  public async findAll(): Promise<TimeDeposit[]> {
    const { rows } = await this.pool.query<TimeDepositRow>(SELECT_ALL)
    return rows.map(toDomain)
  }

  // FOR UPDATE locks the rows until COMMIT, so concurrent runs queue up instead of overwriting each other.
  public async updateAllInTransaction(change: (deposits: TimeDeposit[]) => void): Promise<void> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query<TimeDepositRow>(`${SELECT_ALL} FOR UPDATE`)
      const deposits = rows.map(toDomain)
      change(deposits)
      await client.query(
        `UPDATE "timeDeposits" AS t
            SET balance = u.balance
           FROM unnest($1::int[], $2::numeric[]) AS u (id, balance)
          WHERE t.id = u.id`,
        [deposits.map((d) => d.id), deposits.map((d) => d.balance)],
      )
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
