import type { TimeDeposit } from '../TimeDeposit'
import type { EligibilityRule } from './EligibilityRule'
import type { InterestPolicy } from './InterestPolicy'

const MONTHS_PER_YEAR = 12

export class FixedRateInterestPolicy implements InterestPolicy {
  constructor(
    private readonly annualRate: number,
    private readonly eligibilityRules: EligibilityRule[],
  ) {}

  public calculateMonthlyInterest(deposit: TimeDeposit): number {
    if (!this.eligibilityRules.every((isEligible) => isEligible(deposit))) {
      return 0
    }
    return (deposit.balance * this.annualRate) / MONTHS_PER_YEAR
  }
}
