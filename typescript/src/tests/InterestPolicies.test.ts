import { defaultInterestPolicies } from '../domain/interest/defaultInterestPolicies'
import { InterestPolicy } from '../domain/interest/InterestPolicy'
import { TimeDeposit } from '../domain/TimeDeposit'
import { TimeDepositCalculator } from '../domain/TimeDepositCalculator'

const deposit = (planType: string, days: number, balance = 1200) =>
  new TimeDeposit(1, planType, balance, days)

describe('default interest policies', () => {
  test.each([
    ['basic', 30, 0],
    ['basic', 31, 1],
    ['student', 30, 0],
    ['student', 31, 3],
    ['student', 365, 3],
    ['student', 366, 0],
    ['premium', 30, 0],
    ['premium', 45, 0],
    ['premium', 46, 5],
  ])('%s plan at %i days earns %d on 1200', (planType, days, expected) => {
    const policy = defaultInterestPolicies[planType]

    expect(policy.calculateMonthlyInterest(deposit(planType, days))).toBeCloseTo(expected, 10)
  })
})

describe('TimeDepositCalculator extensibility', () => {
  test('accepts additional policies without modifying existing code', () => {
    const flatBonus: InterestPolicy = { calculateMonthlyInterest: () => 10.004 }
    const deposits = [deposit('bonus', 1, 100), deposit('basic', 31, 1200)]

    new TimeDepositCalculator({ ...defaultInterestPolicies, bonus: flatBonus }).updateBalance(deposits)

    expect(deposits.map((d) => d.balance)).toEqual([110, 1201])
  })
})
