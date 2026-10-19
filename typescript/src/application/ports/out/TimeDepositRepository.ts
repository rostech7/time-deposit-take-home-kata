import { TimeDeposit } from '../../../domain/TimeDeposit'

export interface TimeDepositRepository {
  findAll(): Promise<TimeDeposit[]>
  saveBalances(deposits: TimeDeposit[]): Promise<void>
}
