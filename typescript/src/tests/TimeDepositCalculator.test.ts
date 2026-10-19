import { TimeDeposit } from '../TimeDeposit'
import { TimeDepositCalculator } from '../TimeDepositCalculator'

/**
 * Characterization tests: the expected values below were recorded from the original
 * (pre-refactoring) implementation of `updateBalance`, which the brief states is correct.
 * They pin its exact floating-point output so any refactoring must stay byte-for-byte compatible.
 */

const BALANCES = [1234567, 1000, 0.01, 10.5, 0]

const RECORDED: Array<[string, number, number[]]> = [
  ['basic', 0, [1234567, 1000, 0.01, 10.5, 0]],
  ['basic', 30, [1234567, 1000, 0.01, 10.5, 0]],
  ['basic', 31, [1235595.81, 1000.83, 0.01, 10.51, 0]],
  ['basic', 45, [1235595.81, 1000.83, 0.01, 10.51, 0]],
  ['basic', 365, [1235595.81, 1000.83, 0.01, 10.51, 0]],
  ['basic', 366, [1235595.81, 1000.83, 0.01, 10.51, 0]],
  ['student', 30, [1234567, 1000, 0.01, 10.5, 0]],
  ['student', 31, [1237653.42, 1002.5, 0.01, 10.53, 0]],
  ['student', 365, [1237653.42, 1002.5, 0.01, 10.53, 0]],
  ['student', 366, [1234567, 1000, 0.01, 10.5, 0]],
  ['student', 1000, [1234567, 1000, 0.01, 10.5, 0]],
  ['premium', 30, [1234567, 1000, 0.01, 10.5, 0]],
  ['premium', 31, [1234567, 1000, 0.01, 10.5, 0]],
  ['premium', 45, [1234567, 1000, 0.01, 10.5, 0]],
  ['premium', 46, [1239711.03, 1004.17, 0.01, 10.54, 0]],
  ['premium', 1000, [1239711.03, 1004.17, 0.01, 10.54, 0]],
  ['unknown', 31, [1234567, 1000, 0.01, 10.5, 0]],
  ['unknown', 1000, [1234567, 1000, 0.01, 10.5, 0]],
]

describe('TimeDepositCalculator.updateBalance (characterization)', () => {
  test.each(RECORDED)('%s plan at %i days', (planType, days, expected) => {
    const deposits = BALANCES.map((balance, i) => new TimeDeposit(i + 1, planType, balance, days))

    new TimeDepositCalculator().updateBalance(deposits)

    expect(deposits.map((d) => d.balance)).toEqual(expected)
  })

  test('updates every deposit in the list in place, mixing plan types', () => {
    const deposits = [
      new TimeDeposit(1, 'basic', 1000, 31),
      new TimeDeposit(2, 'student', 1000, 31),
      new TimeDeposit(3, 'premium', 1000, 46),
    ]

    new TimeDepositCalculator().updateBalance(deposits)

    expect(deposits.map((d) => d.balance)).toEqual([1000.83, 1002.5, 1004.17])
  })
})
