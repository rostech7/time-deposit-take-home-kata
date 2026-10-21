import type { TimeDeposit } from '../TimeDeposit'

/**
 * Strategy for computing one month of interest
 */
export interface InterestPolicy {
  calculateMonthlyInterest(deposit: TimeDeposit): number
}

export type InterestPolicies = Record<string, InterestPolicy>
