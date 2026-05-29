export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { label, amount, recurrence, effectiveFrom, effectiveTo } = await readBody(event)

  if (!label || !amount || !recurrence || !effectiveFrom) {
    throw createError({ statusCode: 400, message: 'label, amount, recurrence and effectiveFrom are required' })
  }

  const income = await db.income.create({
    data: {
      label,
      amount,
      recurrence,
      effectiveFrom: new Date(effectiveFrom),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      userId
    }
  })

  setResponseStatus(event, 201)
  return income
})
