import { Withdrawal } from '../../domain/Withdrawal'
import { GetAllTimeDeposits, TimeDepositDetails } from '../ports/in/GetAllTimeDeposits'
import { TimeDepositRepository } from '../ports/out/TimeDepositRepository'
import { WithdrawalRepository } from '../ports/out/WithdrawalRepository'

export class GetAllTimeDepositsService implements GetAllTimeDeposits {
  constructor(
    private readonly timeDeposits: TimeDepositRepository,
    private readonly withdrawals: WithdrawalRepository,
  ) {}

  public async execute(): Promise<TimeDepositDetails[]> {
    const [deposits, withdrawals] = await Promise.all([
      this.timeDeposits.findAll(),
      this.withdrawals.findAll(),
    ])
    const withdrawalsByDeposit = this.groupByTimeDepositId(withdrawals)

    return deposits.map(({ id, planType, balance, days }) => ({
      id,
      planType,
      balance,
      days,
      withdrawals: withdrawalsByDeposit.get(id) ?? [],
    }))
  }

  private groupByTimeDepositId(withdrawals: Withdrawal[]): Map<number, Withdrawal[]> {
    const grouped = new Map<number, Withdrawal[]>()
    for (const withdrawal of withdrawals) {
      const group = grouped.get(withdrawal.timeDepositId) ?? []
      group.push(withdrawal)
      grouped.set(withdrawal.timeDepositId, group)
    }
    return grouped
  }
}
