import type { Pool } from 'pg'
import type { WithdrawalRepository } from '../../../application/ports/out/WithdrawalRepository'
import type { Withdrawal } from '../../../domain/Withdrawal'

interface WithdrawalRow {
  id: number
  timeDepositId: number
  amount: string
  date: string
}

export class PostgresWithdrawalRepository implements WithdrawalRepository {
  constructor(private readonly pool: Pool) {}

  public async findAll(): Promise<Withdrawal[]> {
    const { rows } = await this.pool.query<WithdrawalRow>(
      `SELECT id, "timeDepositId", amount, to_char(date, 'YYYY-MM-DD') AS date
         FROM withdrawals
        ORDER BY date, id`,
    )
    return rows.map((row) => ({ ...row, amount: Number(row.amount) }))
  }
}
