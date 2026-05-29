export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const { label, amount, recurrence, effectiveFrom, effectiveTo } = await readBody(event)

  const existing = await db.income.findFirst({ where: { id, userId } })
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Income not found' })
  }

  return db.income.update({
    where: { id },
    data: {
      ...(label ? { label } : {}),
      ...(amount !== undefined ? { amount } : {}),
      ...(recurrence ? { recurrence } : {}),
      ...(effectiveFrom ? { effectiveFrom: new Date(effectiveFrom) } : {}),
      ...(effectiveTo !== undefined
        ? { effectiveTo: effectiveTo ? new Date(effectiveTo) : null }
        : {})
    }
  })
})
