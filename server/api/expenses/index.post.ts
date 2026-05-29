export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { amount, category, description, date } = await readBody(event)

  if (!amount || !category || !date) {
    throw createError({ statusCode: 400, message: 'amount, category and date are required' })
  }

  const expense = await db.expense.create({
    data: {
      amount,
      category,
      description: description ?? null,
      date: new Date(date),
      userId
    }
  })

  setResponseStatus(event, 201)
  return expense
})
