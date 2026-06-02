export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { from, to } = getQuery(event)

  if (!from || !to) {
    throw createError({ statusCode: 400, message: 'from and to query params are required' })
  }

  const fromDate = new Date(from as string)
  const toDate = new Date(`${to}T23:59:59.999Z`)

  const [expenses, incomes, vaultWithdrawals] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: fromDate, lte: toDate } }
    }),
    db.income.findMany({ where: { userId } }),
    db.vaultDeposit.findMany({
      where: {
        vault: { userId },
        direction: 'OUT',
        date: { gte: fromDate, lte: toDate }
      },
      select: { amount: true }
    })
  ])

  const totalIncome = prorateIncome(incomes, fromDate, toDate)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalWithdrawals = vaultWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0)
  const balance = totalIncome - totalExpenses + totalWithdrawals
  const spentPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
    return acc
  }, {})

  const byCategory = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount: Math.round(amount * 100) / 100,
    percentageOfIncome: totalIncome > 0 ? Math.round((amount / totalIncome) * 10000) / 100 : 0
  }))

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    balance: Math.round(balance * 100) / 100,
    spentPercentage: Math.round(spentPercentage * 100) / 100,
    byCategory
  }
})
