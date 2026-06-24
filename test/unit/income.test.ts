import { describe, it, expect } from 'vitest'
import { prorateIncome } from '../../server/utils/income'

function d(iso: string): Date {
  return new Date(iso)
}

describe('prorateIncome', () => {
  describe('MONTHLY income', () => {
    it('returns full amount for a complete calendar month (January)', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-31'))
      expect(result).toBeCloseTo(1000, 2)
    })

    it('returns full amount for a complete February (non-leap)', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-02-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-02-01'), d('2025-02-28'))
      expect(result).toBeCloseTo(1000, 2)
    })

    it('returns full amount for a complete month of March (31 days)', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-03-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-03-01'), d('2025-03-31'))
      expect(result).toBeCloseTo(1000, 2)
    })

    it('prorates for half a month (15 days of 31)', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-15'))
      expect(result).toBeCloseTo((1000 / 31) * 15, 2)
    })

    it('prorates for a single day', () => {
      const incomes = [{ amount: 3100, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-15'), d('2025-01-15'))
      expect(result).toBeCloseTo(3100 / 31, 2)
    })

    it('handles period crossing two months', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-20'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-20'), d('2025-02-10'))
      // Jan: 12 days of 31 = 1000 * 12/31
      // Feb: 10 days of 28 = 1000 * 10/28
      const expected = (1000 / 31) * 12 + (1000 / 28) * 10
      expect(result).toBeCloseTo(expected, 2)
    })

    it('handles period crossing multiple months', () => {
      const incomes = [{ amount: 500, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-03-31'))
      expect(result).toBeCloseTo(1500, 2) // 3 full months
    })

    it('handles full year = 12 × monthly amount', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-12-31'))
      expect(result).toBeCloseTo(12000, 2)
    })

    it('handles February in a leap year (29 days)', () => {
      const incomes = [{ amount: 2900, recurrence: 'MONTHLY', effectiveFrom: d('2024-02-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2024-02-01'), d('2024-02-29'))
      expect(result).toBeCloseTo(2900, 2)
    })

    it('respects effectiveFrom (starts mid-month)', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-06-15'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-06-01'), d('2025-06-30'))
      // Only counts from June 15 to June 30 = 16 days of 30
      // Wait, actually overlapStart = max(effectiveFrom=Jun15, fromDate=Jun1) = Jun15
      // overlapEnd = min(effectiveTo=Jun30, toDate=Jun30) = Jun30
      // 16 days of 30 = 1000 * 16/30
      const expected = (1000 / 30) * 16
      expect(result).toBeCloseTo(expected, 2)
    })
  })

  describe('WEEKLY income', () => {
    it('returns full amount for exactly 7 days', () => {
      const incomes = [{ amount: 700, recurrence: 'WEEKLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-07'))
      expect(result).toBeCloseTo(700, 2)
    })

    it('returns daily rate for fewer days', () => {
      const incomes = [{ amount: 700, recurrence: 'WEEKLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-03'))
      expect(result).toBeCloseTo(300, 2) // 100/day × 3
    })

    it('returns proportional for more than 7 days', () => {
      const incomes = [{ amount: 700, recurrence: 'WEEKLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-10'))
      expect(result).toBeCloseTo(1000, 2) // 100/day × 10
    })
  })

  describe('BIWEEKLY income', () => {
    it('returns full amount for exactly 14 days', () => {
      const incomes = [{ amount: 1400, recurrence: 'BIWEEKLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-14'))
      expect(result).toBeCloseTo(1400, 2)
    })

    it('returns daily rate for 1 week', () => {
      const incomes = [{ amount: 1400, recurrence: 'BIWEEKLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-07'))
      expect(result).toBeCloseTo(700, 2) // 100/day × 7
    })
  })

  describe('ONE_TIME income', () => {
    it('includes if date is within period (inclusive start)', () => {
      const incomes = [{ amount: 500, recurrence: 'ONE_TIME', effectiveFrom: d('2025-06-15'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-06-01'), d('2025-06-30'))
      expect(result).toBeCloseTo(500, 2)
    })

    it('includes if date is on from boundary', () => {
      const incomes = [{ amount: 500, recurrence: 'ONE_TIME', effectiveFrom: d('2025-06-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-06-01'), d('2025-06-30'))
      expect(result).toBeCloseTo(500, 2)
    })

    it('includes if date is on to boundary', () => {
      const incomes = [{ amount: 500, recurrence: 'ONE_TIME', effectiveFrom: d('2025-06-30'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-06-01'), d('2025-06-30'))
      expect(result).toBeCloseTo(500, 2)
    })

    it('excludes if date is before period', () => {
      const incomes = [{ amount: 500, recurrence: 'ONE_TIME', effectiveFrom: d('2025-05-31'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-06-01'), d('2025-06-30'))
      expect(result).toBe(0)
    })

    it('excludes if date is after period', () => {
      const incomes = [{ amount: 500, recurrence: 'ONE_TIME', effectiveFrom: d('2025-07-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-06-01'), d('2025-06-30'))
      expect(result).toBe(0)
    })
  })

  describe('effectiveTo constraint', () => {
    it('stops counting after effectiveTo date', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: d('2025-03-15') }]
      // Full Jan (31d) + Full Feb (28d) + partial Mar (1-15 = 15d of 31)
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-06-30'))
      const expected = 1000 + 1000 + (1000 / 31) * 15
      expect(result).toBeCloseTo(expected, 2)
    })

    it('returns 0 if effectiveFrom is after toDate', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-07-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-06-30'))
      expect(result).toBe(0)
    })

    it('returns 0 if effectiveTo is before fromDate', () => {
      const incomes = [{ amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: d('2025-01-15') }]
      const result = prorateIncome(incomes, d('2025-02-01'), d('2025-02-28'))
      expect(result).toBe(0)
    })
  })

  describe('multiple incomes', () => {
    it('sums different income types', () => {
      const incomes = [
        { amount: 1000, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null },
        { amount: 700, recurrence: 'WEEKLY', effectiveFrom: d('2025-01-01'), effectiveTo: null },
        { amount: 500, recurrence: 'ONE_TIME', effectiveFrom: d('2025-01-15'), effectiveTo: null }
      ]
      // Monthly: 1000 (full Jan)
      // Weekly: 700/day? No, 700/7=100 per day * 31 = 3100
      // One-time: 500
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-31'))
      const expected = 1000 + (700 / 7) * 31 + 500
      expect(result).toBeCloseTo(expected, 2)
    })

    it('returns 0 for empty array', () => {
      expect(prorateIncome([], d('2025-01-01'), d('2025-12-31'))).toBe(0)
    })
  })

  describe('amount as Decimal / string', () => {
    it('handles amount as string', () => {
      const incomes = [{ amount: '1000' as any, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-31'))
      expect(result).toBeCloseTo(1000, 2)
    })

    it('handles amount with toString (Prisma Decimal)', () => {
      const decimalAmount = { toString: () => '1000' } as any
      const incomes = [{ amount: decimalAmount, recurrence: 'MONTHLY', effectiveFrom: d('2025-01-01'), effectiveTo: null }]
      const result = prorateIncome(incomes, d('2025-01-01'), d('2025-01-31'))
      expect(result).toBeCloseTo(1000, 2)
    })
  })
})
