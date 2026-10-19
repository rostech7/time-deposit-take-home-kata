import type { Pool } from 'pg'
import type { TimeDepositRepository } from '../../../application/ports/out/TimeDepositRepository'
import { TimeDeposit } from '../../../domain/TimeDeposit'

interface TimeDepositRow {
  id: number
  planType: string
  balance: string // pg returns NUMERIC as string to avoid silent precision loss
  days: number
}

export class PostgresTimeDepositRepository implements TimeDepositRepository {
  constructor(private readonly pool: Pool) {}

  public async findAll(): Promise<TimeDeposit[]> {
    const { rows } = await this.pool.query<TimeDepositRow>(
      'SELECT id, "planType", balance, days FROM "timeDeposits" ORDER BY id',
    )
    return rows.map((row) => new TimeDeposit(row.id, row.planType, Number(row.balance), row.days))
  }

  public async saveBalances(deposits: TimeDeposit[]): Promise<void> {
    await this.pool.query(
      `UPDATE "timeDeposits" AS t
          SET balance = u.balance
         FROM unnest($1::int[], $2::numeric[]) AS u (id, balance)
        WHERE t.id = u.id`,
      [deposits.map((d) => d.id), deposits.map((d) => d.balance)],
    )
  }
}
