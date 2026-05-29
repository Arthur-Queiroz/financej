export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { from, to, category } = getQuery(event)

  return db.expense.findMany({
    where: {
      userId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from as string) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {})
            }
          }
        : {}),
      ...(category ? { category: category as string } : {})
    },
    orderBy: { date: 'desc' }
  })
})
