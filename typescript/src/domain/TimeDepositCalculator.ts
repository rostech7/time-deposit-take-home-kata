import { defaultInterestPolicies } from './interest/defaultInterestPolicies'
import { InterestPolicies } from './interest/InterestPolicy'
import { roundToCents } from './Money'
import { TimeDeposit } from './TimeDeposit'

export class TimeDepositCalculator {
  constructor(private readonly policies: InterestPolicies = defaultInterestPolicies) {}

  public updateBalance(xs: TimeDeposit[]) {
    for (const deposit of xs) {
      deposit.balance += roundToCents(this.monthlyInterestFor(deposit))
    }
  }

  private monthlyInterestFor(deposit: TimeDeposit): number {
    const policy = this.policies[deposit.planType]
    return policy ? policy.calculateMonthlyInterest(deposit) : 0
  }
}
