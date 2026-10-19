export interface Withdrawal {
  id: number
  timeDepositId: number
  amount: number
  /** Calendar date in ISO-8601 format (YYYY-MM-DD). */
  date: string
}
