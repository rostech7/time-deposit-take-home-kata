import type { TimeDeposit } from '../TimeDeposit'

export type EligibilityRule = (deposit: TimeDeposit) => boolean

export const GRACE_PERIOD_DAYS = 30

export const olderThanDays =
  (days: number): EligibilityRule =>
  (deposit) =>
    deposit.days > days

export const youngerThanDays =
  (days: number): EligibilityRule =>
  (deposit) =>
    deposit.days < days

export const afterGracePeriod: EligibilityRule = olderThanDays(GRACE_PERIOD_DAYS)
