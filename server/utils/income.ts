const DAYS_PER_PERIOD: Record<string, number> = {
  BIWEEKLY: 14,
  WEEKLY: 7
}

type IncomeRecord = {
  amount: { toString(): string } | number | string
  recurrence: string
  effectiveFrom: Date
  effectiveTo: Date | null
}

// For MONTHLY income: iterate month-by-month using each month's actual day count.
// This ensures Jan-Dec always sums to exactly 12× the monthly amount,
// and any partial month is prorated against that month's real days.
// All comparisons use UTC to avoid timezone-shifted dates (e.g. UTC-3 Brazil).
function prorateMonthly(amount: number, overlapStart: Date, overlapEnd: Date): number {
  let total = 0
  let cursor = new Date(Date.UTC(overlapStart.getUTCFullYear(), overlapStart.getUTCMonth(), 1))

  while (cursor <= overlapEnd) {
    const y = cursor.getUTCFullYear()
    const m = cursor.getUTCMonth()
    const monthStart = new Date(Date.UTC(y, m, 1))
    const monthEnd   = new Date(Date.UTC(y, m + 1, 0))   // last day of month
    const daysInMonth = monthEnd.getUTCDate()

    const sliceStart = overlapStart > monthStart ? overlapStart : monthStart
    const sliceEnd   = overlapEnd  < monthEnd   ? overlapEnd   : monthEnd
    const days = Math.floor((sliceEnd.getTime() - sliceStart.getTime()) / 86_400_000) + 1

    total += (amount / daysInMonth) * days
    cursor = new Date(Date.UTC(y, m + 1, 1))  // first day of next month
  }

  return total
}

export function prorateIncome(incomes: IncomeRecord[], fromDate: Date, toDate: Date): number {
  return incomes.reduce((total, income) => {
    const start = income.effectiveFrom
    const end   = income.effectiveTo ?? toDate

    if (start > toDate || end < fromDate) return total

    const overlapStart = start > fromDate ? start : fromDate
    const overlapEnd   = end   < toDate   ? end   : toDate

    if (income.recurrence === 'MONTHLY') {
      return total + prorateMonthly(Number(income.amount), overlapStart, overlapEnd)
    }

    const days  = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / 86_400_000) + 1
    const daily = Number(income.amount) / (DAYS_PER_PERIOD[income.recurrence] ?? 7)
    return total + daily * days
  }, 0)
}
