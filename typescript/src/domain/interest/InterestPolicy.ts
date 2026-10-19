import type { TimeDeposit } from '../TimeDeposit'

/**
 * Strategy for computing one month of interest. Which plan type uses which policy is
 */
export interface InterestPolicy {
  calculateMonthlyInterest(deposit: TimeDeposit): number
}

export type InterestPolicies = Record<string, InterestPolicy>
