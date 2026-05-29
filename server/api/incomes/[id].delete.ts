export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!

  const existing = await db.income.findFirst({ where: { id, userId } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Income not found' })
  }

  await db.income.delete({ where: { id } })
  return { success: true }
})
