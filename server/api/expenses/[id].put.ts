export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const { amount, category, description, date } = await readBody(event)

  const existing = await db.expense.findFirst({ where: { id, userId } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Expense not found' })
  }

  return db.expense.update({
    where: { id },
    data: {
      ...(amount !== undefined ? { amount } : {}),
      ...(category ? { category } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(date ? { date: new Date(date) } : {})
    }
  })
})
