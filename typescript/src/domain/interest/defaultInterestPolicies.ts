import { afterGracePeriod, olderThanDays, youngerThanDays } from './EligibilityRule'
import { FixedRateInterestPolicy } from './FixedRateInterestPolicy'
import type { InterestPolicies } from './InterestPolicy'

export const defaultInterestPolicies: InterestPolicies = {
  basic: new FixedRateInterestPolicy(0.01, [afterGracePeriod]),

  student: new FixedRateInterestPolicy(0.03, [afterGracePeriod, youngerThanDays(366)]),

  premium: new FixedRateInterestPolicy(0.05, [afterGracePeriod, olderThanDays(45)]),
}
