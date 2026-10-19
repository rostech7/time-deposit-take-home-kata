import type { TimeDeposit } from '../../../domain/TimeDeposit'

export interface TimeDepositRepository {
  findAll(): Promise<TimeDeposit[]>
  updateAllInTransaction(change: (deposits: TimeDeposit[]) => void): Promise<void>
}
