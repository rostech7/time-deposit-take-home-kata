import { Router } from 'express'
import type {
  GetAllTimeDeposits,
  TimeDepositDetails,
} from '../../../application/ports/in/GetAllTimeDeposits'
import type { UpdateAllBalances } from '../../../application/ports/in/UpdateAllBalances'
import type { components } from './generated/openapi'
import { handle } from './handle'

type TimeDepositResponse = components['schemas']['TimeDeposit']

export interface TimeDepositUseCases {
  getAllTimeDeposits: GetAllTimeDeposits
  updateAllBalances: UpdateAllBalances
}

export function timeDepositRoutes({ getAllTimeDeposits, updateAllBalances }: TimeDepositUseCases) {
  const router = Router()

  router.get(
    '/time-deposits',
    handle<TimeDepositResponse[]>(async () => ({
      body: (await getAllTimeDeposits.execute()).map(toResponse),
    })),
  )

  router.post(
    '/time-deposits/balance-updates',
    handle(async () => {
      await updateAllBalances.execute()
      return { status: 204 }
    }),
  )

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
