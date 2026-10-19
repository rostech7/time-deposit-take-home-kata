import { Withdrawal } from '../../../domain/Withdrawal'

export interface TimeDepositDetails {
  id: number
  planType: string
  balance: number
  days: number
  withdrawals: Withdrawal[]
}

export interface GetAllTimeDeposits {
  execute(): Promise<TimeDepositDetails[]>
}
