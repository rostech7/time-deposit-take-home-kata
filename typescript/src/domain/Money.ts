export const roundToCents = (amount: number): number =>
  Math.round((amount + Number.EPSILON) * 100) / 100
