import type { TimeDepositCalculator } from '../../domain/TimeDepositCalculator'
import type { UpdateAllBalances } from '../ports/in/UpdateAllBalances'
import type { TimeDepositRepository } from '../ports/out/TimeDepositRepository'

export class UpdateAllBalancesService implements UpdateAllBalances {
  constructor(
    private readonly timeDeposits: TimeDepositRepository,
    private readonly calculator: TimeDepositCalculator,
  ) {}

  public async execute(): Promise<void> {
    const deposits = await this.timeDeposits.findAll()
    this.calculator.updateBalance(deposits)
    await this.timeDeposits.saveBalances(deposits)
  }
}
