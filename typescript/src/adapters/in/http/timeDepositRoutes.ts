import { Router } from 'express'
import type {
  GetAllTimeDeposits,
  TimeDepositDetails,
} from '../../../application/ports/in/GetAllTimeDeposits'
import type { UpdateAllBalances } from '../../../application/ports/in/UpdateAllBalances'
import type { components } from './generated/openapi'

type TimeDepositResponse = components['schemas']['TimeDeposit']

export interface TimeDepositUseCases {
  getAllTimeDeposits: GetAllTimeDeposits
  updateAllBalances: UpdateAllBalances
}

export function timeDepositRoutes({ getAllTimeDeposits, updateAllBalances }: TimeDepositUseCases) {
  const router = Router()

  router.get<never, TimeDepositResponse[]>('/time-deposits', async (_req, res, next) => {
    try {
      const deposits = await getAllTimeDeposits.execute()
      res.json(deposits.map(toResponse))
    } catch (error) {
      next(error)
    }
  })

  router.post('/time-deposits/balance-updates', async (_req, res, next) => {
    try {
      await updateAllBalances.execute()
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })

  return router
}

function toResponse({
  id,
  planType,
  balance,
  days,
  withdrawals,
}: TimeDepositDetails): TimeDepositResponse {
  return {
    id,
    planType,
    balance,
    days,
    withdrawals: withdrawals.map(({ id, amount, date }) => ({
      id,
      amount,
      date,
    })),
  }
}
