export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!

  const existing = await db.expense.findFirst({ where: { id, userId } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Expense not found' })
  }

  await db.expense.delete({ where: { id } })
  return { success: true }
})
