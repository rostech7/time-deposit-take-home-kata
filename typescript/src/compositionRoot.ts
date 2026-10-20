import type { Pool } from 'pg'
import { createApp } from './adapters/in/http/createApp'
import { PostgresTimeDepositRepository } from './adapters/out/postgres/PostgresTimeDepositRepository'
import { PostgresWithdrawalRepository } from './adapters/out/postgres/PostgresWithdrawalRepository'
import { GetAllTimeDepositsService } from './application/use-cases/GetAllTimeDepositsService'
import { UpdateAllBalancesService } from './application/use-cases/UpdateAllBalancesService'
import { TimeDepositCalculator } from './domain/TimeDepositCalculator'
import { logger } from './logger'

export function buildApp(pool: Pool) {
  const timeDeposits = new PostgresTimeDepositRepository(pool)
  const withdrawals = new PostgresWithdrawalRepository(pool)

  return createApp(
    {
      getAllTimeDeposits: new GetAllTimeDepositsService(timeDeposits, withdrawals),
      updateAllBalances: new UpdateAllBalancesService(timeDeposits, new TimeDepositCalculator()),
    },
    logger,
  )
}
