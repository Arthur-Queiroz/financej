export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  return db.income.findMany({
    where: { userId },
    orderBy: { effectiveFrom: 'desc' }
  })
})
