import { Router } from 'express'
import { GetAllTimeDeposits } from '../../../application/ports/in/GetAllTimeDeposits'
import { UpdateAllBalances } from '../../../application/ports/in/UpdateAllBalances'

export interface TimeDepositUseCases {
  getAllTimeDeposits: GetAllTimeDeposits
  updateAllBalances: UpdateAllBalances
}

export function timeDepositRoutes({ getAllTimeDeposits, updateAllBalances }: TimeDepositUseCases) {
  const router = Router()

  router.get('/time-deposits', async (_req, res, next) => {
    try {
      const deposits = await getAllTimeDeposits.execute()
      // The response nests withdrawals under their deposit, so timeDepositId is redundant there.
      res.json(
        deposits.map((deposit) => ({
          ...deposit,
          withdrawals: deposit.withdrawals.map(({ id, amount, date }) => ({ id, amount, date })),
        })),
      )
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
