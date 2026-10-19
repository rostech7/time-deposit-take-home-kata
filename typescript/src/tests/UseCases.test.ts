import type { TimeDepositRepository } from '../application/ports/out/TimeDepositRepository'
import type { WithdrawalRepository } from '../application/ports/out/WithdrawalRepository'
import { GetAllTimeDepositsService } from '../application/use-cases/GetAllTimeDepositsService'
import { UpdateAllBalancesService } from '../application/use-cases/UpdateAllBalancesService'
import { TimeDeposit } from '../domain/TimeDeposit'
import { TimeDepositCalculator } from '../domain/TimeDepositCalculator'
import type { Withdrawal } from '../domain/Withdrawal'

class InMemoryTimeDepositRepository implements TimeDepositRepository {
  constructor(public stored: TimeDeposit[]) {}
  async findAll() {
    return this.stored.map((d) => new TimeDeposit(d.id, d.planType, d.balance, d.days))
  }
  async saveBalances(deposits: TimeDeposit[]) {
    this.stored = deposits
  }
}

class InMemoryWithdrawalRepository implements WithdrawalRepository {
  constructor(private readonly stored: Withdrawal[]) {}
  async findAll() {
    return this.stored
  }
}

describe('UpdateAllBalancesService', () => {
  test('applies one month of interest to every deposit and persists it', async () => {
    const repository = new InMemoryTimeDepositRepository([
      new TimeDeposit(1, 'basic', 1200, 31),
      new TimeDeposit(2, 'premium', 1200, 40),
    ])

    await new UpdateAllBalancesService(repository, new TimeDepositCalculator()).execute()

    expect(repository.stored.map((d) => d.balance)).toEqual([1201, 1200])
  })
})

describe('GetAllTimeDepositsService', () => {
  test('returns every deposit with its own withdrawals', async () => {
    const withdrawal: Withdrawal = { id: 7, timeDepositId: 2, amount: 50, date: '2026-01-15' }
    const service = new GetAllTimeDepositsService(
      new InMemoryTimeDepositRepository([
        new TimeDeposit(1, 'basic', 1000, 10),
        new TimeDeposit(2, 'student', 2000, 100),
      ]),
      new InMemoryWithdrawalRepository([withdrawal]),
    )

    expect(await service.execute()).toEqual([
      { id: 1, planType: 'basic', balance: 1000, days: 10, withdrawals: [] },
      { id: 2, planType: 'student', balance: 2000, days: 100, withdrawals: [withdrawal] },
    ])
  })
})
