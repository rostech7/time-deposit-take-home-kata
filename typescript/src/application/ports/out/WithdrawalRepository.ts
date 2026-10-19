import type { Withdrawal } from '../../../domain/Withdrawal'

export interface WithdrawalRepository {
  findAll(): Promise<Withdrawal[]>
}
